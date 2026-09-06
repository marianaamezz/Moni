import React from 'react';
import {
  Home,
  User,
  Users,
  Utensils,
  Car,
  HeartPulse,
  Film,
  Wrench,
  Zap,
  Tag,
  CreditCard,
  Banknote,
  Landmark,
  ShoppingBag,
  Gift,
  Coffee,
  DollarSign
} from 'lucide-react';

export function getCategoryIcon(name = '', size = 16, className = '') {
  const norm = name.toLowerCase().trim();

  if (norm.includes('casa') || norm.includes('hogar')) {
    return <Home size={size} className={className} />;
  }
  if (norm === 'yo' || norm.includes('personal') || norm.includes('propio')) {
    return <User size={size} className={className} />;
  }
  if (norm.includes('familia') || norm.includes('hijos') || norm.includes('padres')) {
    return <Users size={size} className={className} />;
  }
  if (norm.includes('comida') || norm.includes('alimento') || norm.includes('mercado') || norm.includes('super')) {
    return <Utensils size={size} className={className} />;
  }
  if (norm.includes('cafe') || norm.includes('café')) {
    return <Coffee size={size} className={className} />;
  }
  if (norm.includes('transporte') || norm.includes('auto') || norm.includes('taxi') || norm.includes('gasolina') || norm.includes('pasaje')) {
    return <Car size={size} className={className} />;
  }
  if (norm.includes('salud') || norm.includes('medicin') || norm.includes('doctor') || norm.includes('farmacia')) {
    return <HeartPulse size={size} className={className} />;
  }
  if (norm.includes('entretenimiento') || norm.includes('cine') || norm.includes('ocio') || norm.includes('diversion') || norm.includes('diversión')) {
    return <Film size={size} className={className} />;
  }
  if (norm.includes('arreglo') || norm.includes('mantenimiento') || norm.includes('reparacion') || norm.includes('reparación')) {
    return <Wrench size={size} className={className} />;
  }
  if (norm.includes('servicio') || norm.includes('luz') || norm.includes('agua') || norm.includes('gas') || norm.includes('internet') || norm.includes('telefono')) {
    return <Zap size={size} className={className} />;
  }
  if (norm.includes('compra') || norm.includes('ropa')) {
    return <ShoppingBag size={size} className={className} />;
  }
  if (norm.includes('regalo')) {
    return <Gift size={size} className={className} />;
  }
  if (norm.includes('efectivo')) {
    return <Banknote size={size} className={className} />;
  }
  if (norm.includes('tarjeta') || norm.includes('debito') || norm.includes('débito') || norm.includes('credito') || norm.includes('crédito')) {
    return <CreditCard size={size} className={className} />;
  }
  if (norm.includes('banco') || norm.includes('cuenta')) {
    return <Landmark size={size} className={className} />;
  }

  return <Tag size={size} className={className} />;
}
