import React from 'react';
import { motion } from 'motion/react';
import { type LucideIcon } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';

type Props = {
  title: string;
  icon: LucideIcon;
};

export function AdminPlaceholder({ title, icon: Icon }: Props) {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 12rem)' }}
      >
        <div className="text-center">
          <Icon className="w-16 h-16 text-silver mx-auto mb-6" />
          <h2 className="text-2xl font-display font-light text-graphite mb-4">{title}</h2>
          <p className="text-silver">Questa sezione sar&agrave; disponibile a breve</p>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
