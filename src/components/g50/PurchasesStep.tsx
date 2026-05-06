'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, TrendingDown, Calculator, AlertCircle, Info } from 'lucide-react'
import { useState } from 'react'
import Decimal from 'decimal.js'
import { FiscalTooltip } from '@/components/ui/FiscalTooltip'

interface PurchasesStepProps {
  data: any
  updateData: (data: any) => void
  onPenaltiesChange: (penalties: any[]) => void
}

const categories = [
  { value: 'goods', label: 'Marchandises', deductible: '100%' },
  { value: 'materials', label: 'Matières premières', deductible: '100%' },
  { value: 'equipment', label: 'Équipements', deductible: '100%' },
  { value: 'vehicle', label: 'Véhicules', deductible: '50% (Art. 33)' },
  { value: 'services', label: 'Services', deductible: '100%' },
  { value: 'hospitality', label: 'Hébergement/Restauration', deductible: '0% (Art. 33)' }
]

export default function PurchasesStep({ data, updateData, onPenaltiesChange }: PurchasesStepProps) {
  const { t } = useI18n()
  const [newPurchase, setNewPurchase] = useState({
    date: '',
    description: '',
    ht_amount: '',
    tva_rate: '19',
    category: 'goods',
    invoice_ref: ''
  })

  const addPurchase = () => {
    if (!newPurchase.ht_amount || !newPurchase.date) return
    const updated = [...data.purchases, { ...newPurchase }]
    updateData({ purchases: updated })
    setNewPurchase({ date: '', description: '', ht_amount: '', tva_rate: '19', category: 'goods', invoice_ref: '' })
    checkPenalties(updated)
  }

  const removePurchase = (index: number) => {
    const updated = data.purchases.filter((_: any, i: number) => i !== index)
    updateData({ purchases: updated })
    checkPenalties(updated)
  }

  const checkPenalties = (purchases: any[]) => {
    const penalties: any[] = []
    if (purchases.length === 0) {
      penalties.push({ type: 'NO_PURCHASES', message: t('penalties.noPurchases'), severity: 'warning' as const })
    }
    const missingInvoices = purchases.some((p: any) => !p.invoice_ref)
    if (missingInvoices) {
      penalties.push({ type: 'MISSING_INVOICE', message: t('penalties.missingInvoice'), severity: 'warning' as const })
    }
    const hasVehicle = purchases.some(p => p.category === 'vehicle')
    const hasHospitality = purchases.some(p => p.category === 'hospitality')
    
    if (hasVehicle) {
      penalties.push({ type: 'VEHICLE_CAP', message: t('penalties.vehicleCap'), severity: 'warning' as const })
    }
    if (hasHospitality) {
      penalties.push({ type: 'HOSPITALITY_NO_DEDUCT', message: t('penalties.hospitalityNoDeduct'), severity: 'warning' as const })
    }
    onPenaltiesChange(penalties)
  }

  const totals = data.purchases.reduce(
    (acc: { ht: Decimal; grossTva: Decimal; deductible: Decimal }, purchase: any) => {
      const ht = new Decimal(purchase.ht_amount || 0)
      const rate = new Decimal(purchase.tva_rate || 0)
      const grossTva = ht.mul(rate).div(100)
      
      let deductibility = new Decimal(1)
      if (purchase.category === 'vehicle') deductibility = new Decimal(0.5)
      if (purchase.category === 'hospitality') deductibility = new Decimal(0)
      
      const deductibleTva = grossTva.mul(deductibility)
      
      return { 
        ht: acc.ht.add(ht), 
        grossTva: acc.grossTva.add(grossTva),
        deductible: acc.deductible.add(deductibleTva)
      }
    },
    { ht: new Decimal(0), grossTva: new Decimal(0), deductible: new Decimal(0) }
  )

  const getDeductibleLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.deductible || '100%'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            {t('wizard.purchases.title')}
          </CardTitle>
          <CardDescription>{t('wizard.purchases.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('wizard.purchases.date')}</Label>
              <Input
                type="date"
                value={newPurchase.date}
                onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">{t('wizard.purchases.description')}</Label>
              <Input
                placeholder={t('wizard.purchases.descriptionPlaceholder')}
                value={newPurchase.description}
                onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                {t('wizard.purchases.amount')} <FiscalTooltip term="ht" />
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={newPurchase.ht_amount}
                onChange={(e) => setNewPurchase({ ...newPurchase, ht_amount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('wizard.purchases.category')}</Label>
              <Select
                value={newPurchase.category}
                onValueChange={(v) => setNewPurchase({ ...newPurchase, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                {t('wizard.purchases.rate')} <FiscalTooltip term="tva" />
              </Label>
              <Input
                type="number"
                value={newPurchase.tva_rate}
                onChange={(e) => setNewPurchase({ ...newPurchase, tva_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('wizard.purchases.invoiceRef')}</Label>
              <Input
                placeholder={t('wizard.purchases.invoiceRefPlaceholder')}
                value={newPurchase.invoice_ref}
                onChange={(e) => setNewPurchase({ ...newPurchase, invoice_ref: e.target.value })}
              />
            </div>
            <div className="md:col-span-4 flex items-end">
              <Button onClick={addPurchase} className="w-full">
                <Plus className="h-4 w-4 me-2" />
                {t('wizard.purchases.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.purchases.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{t('wizard.purchases.tableTitle')}</CardTitle>
              <div className="flex gap-4 text-sm">
                <span><FiscalTooltip term="ht" />: <span className="font-medium">{totals.ht.toFixed(2)} DZD</span></span>
                <span><FiscalTooltip term="tva" />: <span className="font-medium">{totals.grossTva.toFixed(2)} DZD</span></span>
                <span className="text-blue-600 dark:text-blue-400">
                  {t('wizard.purchases.deductible')}: <span className="font-medium">{totals.deductible.toFixed(2)} DZD</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('wizard.purchases.date')}</TableHead>
                  <TableHead>{t('wizard.purchases.description')}</TableHead>
                  <TableHead><FiscalTooltip term="ht" /></TableHead>
                  <TableHead><FiscalTooltip term="tva" /></TableHead>
                  <TableHead>{t('wizard.purchases.category')}</TableHead>
                  <TableHead>{t('wizard.purchases.invoiceRef')}</TableHead>
                  <TableHead><FiscalTooltip term="tva" /> / Déd.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.purchases.map((purchase: any, idx: number) => {
                  const ht = new Decimal(purchase.ht_amount)
                  const rate = new Decimal(purchase.tva_rate || 0)
                  const grossTva = ht.mul(rate).div(100)
                  
                  let deductibility = new Decimal(1)
                  if (purchase.category === 'vehicle') deductibility = new Decimal(0.5)
                  if (purchase.category === 'hospitality') deductibility = new Decimal(0)
                  const deductibleTva = grossTva.mul(deductibility)
                  
                  return (
                    <TableRow key={idx}>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.description}</TableCell>
                      <TableCell>{ht.toFixed(2)}</TableCell>
                      <TableCell>{rate.toString()}%</TableCell>
                      <TableCell>
                        <Badge variant={purchase.category === 'vehicle' || purchase.category === 'hospitality' ? 'destructive' : 'secondary'}>
                          {categories.find(c => c.value === purchase.category)?.label || purchase.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{purchase.invoice_ref}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {grossTva.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {deductibleTva.toFixed(2)} ({getDeductibleLabel(purchase.category)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removePurchase(idx)}>
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

      {data.purchases.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">{t('wizard.purchases.empty')}</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">{t('wizard.purchases.art33Title')}</p>
          <p>{t('wizard.purchases.art33Info')}</p>
        </div>
      </div>
    </div>
  )
}