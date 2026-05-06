'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, Building2, FileText, Search, Loader2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  company: string
  nif: string
  declarationsCount: number
  lastActivity: string
}

export default function AccountantClientsPage() {
  const { t } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newClient, setNewClient] = useState({ email: '', name: '', company: '', nif: '' })
  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/accountant/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Load clients error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadClients, 0)
    return () => clearTimeout(timer)
  }, [loadClients])

  const addClient = async () => {
    try {
      const res = await fetch('/api/accountant/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      if (res.ok) {
        loadClients()
        setShowAdd(false)
        setNewClient({ email: '', name: '', company: '', nif: '' })
      }
    } catch (error) {
      console.error('Add client error:', error)
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('accountant.title', { defaultValue: 'Mes Clients' })}
          </h1>
          <p className="text-muted-foreground">
            {t('accountant.subtitle', { defaultValue: 'Gérez vos clients et leurs déclarations' })}
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('accountant.addClient', { defaultValue: 'Ajouter un client' })}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>{t('accountant.addClientTitle', { defaultValue: 'Nouveau client' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('accountant.email', { defaultValue: 'Email' })}</Label>
                <Input 
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accountant.name', { defaultValue: 'Nom' })}</Label>
                <Input 
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accountant.company', { defaultValue: 'Entreprise' })}</Label>
                <Input 
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accountant.nif', { defaultValue: 'NIF' })}</Label>
                <Input 
                  value={newClient.nif}
                  onChange={(e) => setNewClient({ ...newClient, nif: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                {t('common.cancel', { defaultValue: 'Annuler' })}
              </Button>
              <Button onClick={addClient}>
                {t('accountant.add', { defaultValue: 'Ajouter' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            className="pl-9"
            placeholder={t('accountant.search', { defaultValue: 'Rechercher un client...' })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <>
          <div className="md:hidden space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                {t('accountant.noClients', { defaultValue: 'Aucun client trouvé' })}
              </div>
            ) : (
              filteredClients.map((client) => (
                <div key={client.id} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">{t('accountant.entreprise', { defaultValue: 'Entreprise' })}</div>
                      <div className="font-medium">{client.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-muted-foreground">{t('accountant.nif', { defaultValue: 'NIF' })}</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{client.nif}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">{t('accountant.declarations', { defaultValue: 'Déclarations' })}</div>
                      <Badge variant="outline">{client.declarationsCount}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-muted-foreground">{t('accountant.derniereActivite', { defaultValue: 'Dernière activité' })}</div>
                      <div className="text-muted-foreground text-xs">{client.lastActivity}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('accountant.client', { defaultValue: 'Client' })}</TableHead>
                  <TableHead>{t('accountant.entreprise', { defaultValue: 'Entreprise' })}</TableHead>
                  <TableHead>{t('accountant.nif', { defaultValue: 'NIF' })}</TableHead>
                  <TableHead>{t('accountant.declarations', { defaultValue: 'Déclarations' })}</TableHead>
                  <TableHead>{t('accountant.derniereActivite', { defaultValue: 'Dernière activité' })}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('accountant.noClients', { defaultValue: 'Aucun client trouvé' })}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{client.company}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{client.nif}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.declarationsCount}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {client.lastActivity}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">{t('accountant.totalClients', { defaultValue: 'Clients actifs' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {clients.reduce((acc, c) => acc + c.declarationsCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">{t('accountant.totalDeclarations', { defaultValue: 'Déclarations' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">G50</p>
                <p className="text-sm text-muted-foreground">{t('accountant.typeDeclaration', { defaultValue: 'Type principal' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}