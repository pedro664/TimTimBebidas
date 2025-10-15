import React from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function AdminProductNew() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/produtos">Produtos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Adicionar Produto</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adicionar Produto</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os campos abaixo para adicionar um novo produto ao catálogo
          </p>
        </div>

        {/* Product Form */}
        <AdminProductForm mode="add" />
      </div>
    </AdminLayout>
  );
}
