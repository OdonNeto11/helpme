// src/components/ui/Logo.jsx
import { cn } from '../../lib/utils';

export function Logo({ size = 'md', variant = 'full', className }) {
  const isIcon = variant === 'icon';

  // Se for ícone, o tamanho é quadrado. Se for full (completa), é retangular.
  const sizes = {
    sm: isIcon ? 'w-10 h-10' : 'w-24 h-auto',
    md: isIcon ? 'w-12 h-12' : 'w-32 h-auto',
    lg: isIcon ? 'w-16 h-16' : 'w-48 h-auto'
  };
  
  const imgSrc = isIcon ? "/logo_somente_imagem.png" : "/logo_helpme.png";

  return (
    <div className={cn("flex items-center justify-center", sizes[size], className)}>
      <img 
        src={imgSrc} 
        alt="Logo Help-Me" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}