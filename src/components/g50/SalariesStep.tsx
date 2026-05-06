'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Users, Calculator, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import Decimal from 'decimal.js'
import { FiscalTooltip } from '@/components/ui/FiscalTooltip'
import { calculateSingleSalaryIRG } from '@/lib/irg-salaires-engine'

interface SalariesStepProps {
  data: any
  updateData: any
  onPenaltiesChange: any
}

interface SalaryLine {
  employeeName: string
  grossSalary: string
  familyChildren: number
}

const CNAS_EMPLOYEE_RATE = 0.09
const CNAS_EMPLOYER_RATE = 0.26

export default function SalariesStep({ data, updateData, onPenaltiesChange }: SalariesStepProps) {
  const { t } = useI18n()
  const [newSalary, setNewSalary] = useState<SalaryLine>({ employeeName: '', grossSalary: '', familyChildren: 0 })
  const [hasEmployees, setHasEmployees] = useState(data.salaries.length > 0)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addSalary = () => {
    if (!newSalary.employeeName || !newSalary.grossSalary) return
    const updated = [...data.salaries, { ...newSalary }]
    updateData({ salaries: updated })
    setNewSalary({ employeeName: '', grossSalary: '', familyChildren: 0 })
    setHasEmployees(true)
  }

  const removeSalary = (index: number) => {
    const updated = data.salaries.filter((_: any, i: number) => i !== index)
    updateData({ salaries: updated })
    setHasEmployees(updated.length > 0)
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        alert(t('wizard.salaries.importError'))
        return
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim())
      const nameIdx = header.findIndex(h => h.includes('name') || h.includes('employé'))
      const grossIdx = header.findIndex(h => h.includes('gross') || h.includes('salaire') || h.includes('brut'))
      const childrenIdx = header.findIndex(h => h.includes('children') || h.includes('enfants'))

      if (nameIdx === -1 || grossIdx === -1) {
        alert(t('wizard.salaries.importFormatError'))
        return
      }

      const newSalaries: SalaryLine[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        if (cols.length >= 2 && cols[nameIdx] && cols[grossIdx]) {
          const gross = cols[grossIdx].replace(/[^\d.]/g, '')
          if (gross && !isNaN(parseFloat(gross))) {
            newSalaries.push({
              employeeName: cols[nameIdx],
              grossSalary: gross,
              familyChildren: childrenIdx !== -1 ? parseInt(cols[childrenIdx]) || 0 : 0
            })
          }
        }
      }

      if (newSalaries.length > 0) {
        updateData({ salaries: [...data.salaries, ...newSalaries] })
        setHasEmployees(true)
      }
    } catch (err) {
      console.error('CSV import error:', err)
      alert(t('wizard.salaries.importError'))
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const calculateTotals = () => {
    let totalGross = new Decimal(0)
    let totalIRG = new Decimal(0)
    let totalCnasEmployee = new Decimal(0)
    let totalCnasEmployer = new Decimal(0)
    let totalNet = new Decimal(0)

    data.salaries.forEach((salary: any) => {
      const gross = new Decimal(salary.grossSalary || 0)
      const { irg, net, cnas } = calculateSingleSalaryIRG(gross)
      
      totalGross = totalGross.add(gross)
      totalIRG = totalIRG.add(irg)
      totalCnasEmployee = totalCnasEmployee.add(cnas)
      totalCnasEmployer = totalCnasEmployer.add(gross.mul(CNAS_EMPLOYER_RATE))
      totalNet = totalNet.add(net)
    })

    return { totalGross, totalIRG, totalCnasEmployee, totalCnasEmployer, totalNet }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('wizard.salaries.title')}
          </CardTitle>
          <CardDescription>{t('wizard.salaries.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Label>{t('wizard.salaries.employeeName')}</Label>
              <Input
                placeholder="Ex: Mohamed Amine"
                value={newSalary.employeeName}
                onChange={(e) => setNewSalary({ ...newSalary, employeeName: e.target.value })}
              />
            </div>
            <div className="md:col-span-1">
              <Label>{t('wizard.salaries.grossSalary')}</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="45000"
                value={newSalary.grossSalary}
                onChange={(e) => setNewSalary({ ...newSalary, grossSalary: e.target.value })}
              />
            </div>
            <div className="md:col-span-1">
              <Label>{t('wizard.salaries.children')}</Label>
              <Input
                type="number"
                value={newSalary.familyChildren}
                onChange={(e) => setNewSalary({ ...newSalary, familyChildren: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addSalary} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t('common.add')}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground italic">
              * {t('wizard.salaries.ruleNote')}
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleCSVImport}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? t('common.loading') : t('wizard.salaries.import')}
              </Button>
            </div>
          </div>

          {data.salaries.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('wizard.salaries.table.name')}</TableHead>
                    <TableHead>{t('wizard.salaries.table.gross')}</TableHead>
                    <TableHead>{t('wizard.salaries.table.irg')}</TableHead>
                    <TableHead>{t('wizard.salaries.table.cnas')}</TableHead>
                    <TableHead>{t('wizard.salaries.table.net')}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.salaries.map((salary: any, index: number) => {
                    const gross = new Decimal(salary.grossSalary)
                    const { irg, net, cnas } = calculateSingleSalaryIRG(gross)
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{salary.employeeName}</TableCell>
                        <TableCell>{gross.toFixed(2)} DZD</TableCell>
                        <TableCell className="text-red-600 font-medium">-{irg.toFixed(2)}</TableCell>
                        <TableCell>-{cnas.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">{net.toFixed(2)} DZD</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeSalary(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs text-muted-foreground">{t('wizard.salaries.totals.gross')}</Label>
              <p className="text-lg font-bold">{totals.totalGross.toFixed(2)} DZD</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
              <Label className="text-xs text-red-600 dark:text-red-400">{t('wizard.salaries.totals.irg')}</Label>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{totals.totalIRG.toFixed(2)} DZD</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <Label className="text-xs text-blue-600 dark:text-blue-400">{t('wizard.salaries.totals.cnas')}</Label>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{totals.totalCnasEmployee.toFixed(2)} DZD</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
              <Label className="text-xs text-green-600 dark:text-green-400">{t('wizard.salaries.totals.net')}</Label>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{totals.totalNet.toFixed(2)} DZD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}