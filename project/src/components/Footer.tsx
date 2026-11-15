import { HardHat, Mail, Phone, MapPin } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { ALL_CITIES } from '@/lib/types';

export default function Footer() {
  const { navigate } = useNav();

  return (
    <footer className="mt-auto bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <HardHat className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="leading-none">
                <span className="font-display text-xl font-extrabold">Pronto<span className="text-orange-500">bra</span></span>
                <p className="mt-0.5 text-[11px] text-white/60">Conectando quem constrói a quem precisa</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">
              A plataforma que conecta profissionais da construção civil a clientes e empresas em Andradina (SP) e região, incluindo o Mato Grosso do Sul.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Plataforma</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => navigate({ name: 'home' })} className="hover:text-orange-400">Início</button></li>
              <li><button onClick={() => navigate({ name: 'professionals' })} className="hover:text-orange-400">Profissionais</button></li>
              <li><button onClick={() => navigate({ name: 'jobs' })} className="hover:text-orange-400">Vagas</button></li>
              <li><button onClick={() => navigate({ name: 'post-job' })} className="hover:text-orange-400">Publicar Vaga</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Região de Atendimento</h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> Andradina — SP</li>
              <li className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> Três Lagoas — MS</li>
              <li className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> Castilho — SP</li>
              <li className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> Ilha Solteira — SP</li>
              <li className="text-xs text-white/50">+ {ALL_CITIES.length - 4} cidades da região</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Contato</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2"><Mail size={16} className="text-orange-500" /> contato@prontobra.com.br</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-orange-500" /> (18) 3000-0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/50">
            © {new Date().getFullYear()} Prontobra. Todos os direitos reservados. Plataforma para profissionais e empresas da construção civil.
          </p>
        </div>
      </div>
    </footer>
  );
}
