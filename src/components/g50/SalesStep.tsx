'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, TrendingUp, Calculator, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import Decimal from 'decimal.js'
import { FiscalTooltip } from '@/components/ui/FiscalTooltip'

interface SalesStepProps {
  data: any
  updateData: (data: any) => void
  onPenaltiesChange: (penalties: any[]) => void
}

export default function SalesStep({ data, updateData, onPenaltiesChange }: SalesStepProps) {
  const { t } = useI18n()
  const [newSale, setNewSale] = useState({ date: '', description: '', ht_amount: '', tva_rate: '19', invoice_ref: '' })

  const addSale = () => {
    if (!newSale.ht_amount || !newSale.date) return
    const updated = [...data.sales, { ...newSale, tva_rate: newSale.tva_rate + '%' }]
    updateData({ sales: updated })
    setNewSale({ date: '', description: '', ht_amount: '', tva_rate: '19', invoice_ref: '' })
    checkPenalties(updated)
  }

  const removeSale = (index: number) => {
    const updated = data.sales.filter((_: any, i: number) => i !== index)
    updateData({ sales: updated })
    checkPenalties(updated)
  }

  const checkPenalties = (sales: any[]) => {
    const penalties: any[] = []
    if (sales.length === 0) {
      penalties.push({ type: 'NO_SALES', message: t('penalties.noSales'), severity: 'warning' as const })
    }
    onPenaltiesChange(penalties)
  }

  const totals = data.sales.reduce(
    (acc: { ht: Decimal; tva: Decimal }, sale: any) => {
      const ht = new Decimal(sale.ht_amount || 0)
      const rate = new Decimal(sale.tva_rate.replace('%', '') || 0)
      const tva = ht.mul(rate).div(100)
      return { ht: acc.ht.add(ht), tva: acc.tva.add(tva) }
    },
    { ht: new Decimal(0), tva: new Decimal(0) }
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('wizard.sales.title')}
          </CardTitle>
          <CardDescription>{t('wizard.sales.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('wizard.sales.date')}</Label>
              <Input
                type="date"
                value={newSale.date}
                onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">{t('wizard.sales.description')}</Label>
              <Input
                placeholder={t('wizard.sales.descriptionPlaceholder')}
                value={newSale.description}
                onChange={(e) => setNewSale({ ...newSale, description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                {t('wizard.sales.amount')} <FiscalTooltip term="ht" />
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={newSale.ht_amount}
                onChange={(e) => setNewSale({ ...newSale, ht_amount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                {t('wizard.sales.rate')} <FiscalTooltip term="tva" />
              </Label>
              <Input
                type="number"
                value={newSale.tva_rate}
                onChange={(e) => setNewSale({ ...newSale, tva_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">{t('wizard.sales.invoiceRef')}</Label>
              <Input
                placeholder={t('wizard.sales.invoiceRefPlaceholder')}
                value={newSale.invoice_ref}
                onChange={(e) => setNewSale({ ...newSale, invoice_ref: e.target.value })}
              />
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button onClick={addSale} className="w-full">
                <Plus className="h-4 w-4 me-2" />
                {t('wizard.sales.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.sales.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{t('wizard.sales.tableTitle')}</CardTitle>
              <div className="flex gap-4 text-sm">
                <span>
                  <FiscalTooltip term="ht" />: <span className="font-medium">{totals.ht.toFixed(2)} DZD</span>
                </span>
                <span>
                  <FiscalTooltip term="tva" />: <span className="font-medium">{totals.tva.toFixed(2)} DZD</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('wizard.sales.date')}</TableHead>
                  <TableHead>{t('wizard.sales.description')}</TableHead>
                  <TableHead>
                    <FiscalTooltip term="ht" />
                  </TableHead>
                  <TableHead>{t('wizard.sales.rate')}</TableHead>
                  <TableHead>
                    <FiscalTooltip term="tva" />
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sales.map((sale: any, idx: number) => {
                  const ht = new Decimal(sale.ht_amount)
                  const rate = new Decimal(sale.tva_rate.replace('%', ''))
                  const tva = ht.mul(rate).div(100)
                  return (
                    <TableRow key={idx}>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.description}</TableCell>
                      <TableCell>{ht.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={rate.toNumber() === 19 ? 'default' : 'secondary'}>
                          {rate.toString()}%
                        </Badge>
                      </TableCell>
                      <TableCell>{tva.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeSale(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.sales.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">{t('wizard.sales.empty')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}