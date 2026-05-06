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

const IRG_BRACKETS = [
  { max: 120000, rate: 0 },
  { max: 360000, rate: 0.20 },
  { max: 1440000, rate: 0.30 },
  { max: 3600000, rate: 0.35 },
  { max: Infinity, rate: 0.35 }
]

const CNAS_EMPLOYEE_RATE = 0.09
const CNAS_EMPLOYER_RATE = 0.26
const FAMILY_DEDUCTION_PER_CHILD = 1000

function calculateIRG(gross: Decimal, children: number): { irg: Decimal; net: Decimal; breakdown: string } {
  const taxable = gross.sub(FAMILY_DEDUCTION_PER_CHILD * children)
  if (taxable.lt(0)) {
    return { irg: new Decimal(0), net: gross, breakdown: 'Exonéré (après déduction familiale)' }
  }
  
  let remaining = taxable.toNumber()
  let totalTax = 0
  let previousMax = 0
  
  for (const bracket of IRG_BRACKETS) {
    if (remaining <= 0) break
    const taxableInBracket = Math.min(remaining, bracket.max - previousMax)
    if (taxableInBracket > 0) {
      totalTax += taxableInBracket * bracket.rate
      remaining -= taxableInBracket
      previousMax = bracket.max
    }
  }
  
  const irg = new Decimal(totalTax)
  const cnasEmployee = gross.mul(CNAS_EMPLOYEE_RATE)
  const net = gross.sub(irg).sub(cnasEmployee)
  
  return { 
    irg, 
    net,
    breakdown: `IRG: ${irg.toFixed(0)} DZD + CNAS: ${cnasEmployee.toFixed(0)} DZD`
  }
}

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
      const gross = new Decimal(salary.grossSalary)
      const { irg, net } = calculateIRG(gross, salary.familyChildren)
      const cnasEmployee = gross.mul(CNAS_EMPLOYEE_RATE)
      const cnasEmployer = gross.mul(CNAS_EMPLOYER_RATE)

      totalGross = totalGross.add(gross)
      totalIRG = totalIRG.add(irg)
      totalCnasEmployee = totalCnasEmployee.add(cnasEmployee)
      totalCnasEmployer = totalCnasEmployer.add(cnasEmployer)
      totalNet = totalNet.add(net)
    })

    return { totalGross, totalIRG, totalCnasEmployee, totalCnasEmployer, totalNet }
  }

  const totals = data.salaries.length > 0 ? calculateTotals() : null

  return (
    <div className="space-y-6">
      {!hasEmployees && data.salaries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('wizard.salaries.title')}
            </CardTitle>
            <CardDescription>{t('wizard.salaries.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('wizard.salaries.question')}</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => { setHasEmployees(true); updateData({ salaries: [] }) }}>
                  {t('wizard.salaries.yes')}
                </Button>
                <Button variant="outline" onClick={() => onPenaltiesChange([])}>
                  {t('wizard.salaries.no')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('wizard.salaries.addTitle')}
              </CardTitle>
              <CardDescription>{t('wizard.salaries.addDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('wizard.salaries.employeeName')}</Label>
                  <Input
                    placeholder={t('wizard.salaries.employeeNamePlaceholder')}
                    value={newSalary.employeeName}
                    onChange={(e) => setNewSalary({ ...newSalary, employeeName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('wizard.salaries.grossSalary')}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newSalary.grossSalary}
                    onChange={(e) => setNewSalary({ ...newSalary, grossSalary: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('wizard.salaries.children')}</Label>
                  <Select
                    value={String(newSalary.familyChildren)}
                    onValueChange={(v) => setNewSalary({ ...newSalary, familyChildren: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 0 ? '' : n === 1 ? 'enfant' : 'enfants'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={addSalary} className="flex-1">
                    <Plus className="h-4 w-4 me-2" />
                    {t('wizard.salaries.add')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    {importing ? (
                      <Calculator className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVImport}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {data.salaries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{t('wizard.salaries.tableTitle')}</CardTitle>
                  {totals && (
                    <div className="flex gap-4 text-sm">
                      <span>Brut: <span className="font-medium">{totals.totalGross.toFixed(0)} DZD</span></span>
                      <span><FiscalTooltip term="irg" />: <span className="font-medium">{totals.totalIRG.toFixed(0)} DZD</span></span>
                      <span>Net: <span className="font-medium">{totals.totalNet.toFixed(0)} DZD</span></span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('wizard.salaries.employeeName')}</TableHead>
                      <TableHead>{t('wizard.salaries.grossSalary')}</TableHead>
                      <TableHead>{t('wizard.salaries.children')}</TableHead>
                      <TableHead><FiscalTooltip term="irg" /></TableHead>
                      <TableHead><FiscalTooltip term="cnas" /></TableHead>
                      <TableHead>{t('wizard.salaries.netSalary')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.salaries.map((salary: any, idx: number) => {
                      const gross = new Decimal(salary.grossSalary)
                      const { irg, net } = calculateIRG(gross, salary.familyChildren)
                      const cnasEmployee = gross.mul(CNAS_EMPLOYEE_RATE)
                      
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{salary.employeeName}</TableCell>
                          <TableCell>{gross.toFixed(0)} DZD</TableCell>
                          <TableCell>
                            <Badge variant="outline">{salary.familyChildren}</Badge>
                          </TableCell>
                          <TableCell className="text-red-600">-{irg.toFixed(0)}</TableCell>
                          <TableCell className="text-orange-600">-{cnasEmployee.toFixed(0)}</TableCell>
                          <TableCell className="text-green-600 font-medium">{net.toFixed(0)} DZD</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeSalary(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {totals && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">{t('wizard.salaries.summaryTitle')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('wizard.salaries.totalGross')}</span>
                        <p className="font-medium">{totals.totalGross.toFixed(0)} DZD</p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('wizard.salaries.totalIrg')}</span>
                        <p className="font-medium text-red-600">-{totals.totalIRG.toFixed(0)} DZD</p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('wizard.salaries.totalCnasEmp')}</span>
                        <p className="font-medium text-orange-600">-{totals.totalCnasEmployee.toFixed(0)} DZD</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('wizard.salaries.totalCnasPat')}</span>
                        <p className="font-medium">{totals.totalCnasEmployer.toFixed(0)} DZD</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-medium">{t('wizard.salaries.totalNet')}</span>
                        <p className="font-medium text-green-600">{totals.totalNet.toFixed(0)} DZD</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => { setHasEmployees(false); updateData({ salaries: [] }) }}>
              {t('wizard.salaries.noEmployees')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}