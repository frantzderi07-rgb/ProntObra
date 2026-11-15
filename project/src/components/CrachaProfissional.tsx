

import { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  CreditCard,
  HardHat,
  Eye,
  EyeOff,
  QrCode,
  Printer,
} from 'lucide-react';

export interface DadosCracha {
  nome: string;
  profissao: string;
  dataNascimento: string;
  documentoTipo?: 'CPF' | 'RG';
  documentoNumero: string;
  cidade: string;
  fotoUrl?: string;
  codigoRegistro?: string;
  verificado?: boolean;
}

interface CrachaProfissionalProps {
  dados: DadosCracha;
  permitirImprimir?: boolean;
}

export default function CrachaProfissional({
  dados,
  permitirImprimir = true,
}: CrachaProfissionalProps) {
  const [mostrarDocCompleto, setMostrarDocCompleto] = useState(false);

  const formatarDocumentoSeguranca = (doc: string) => {
    if (mostrarDocCompleto) return doc;
    const limpo = doc.replace(/\D/g, '');
    if (limpo.length === 11) {
      return `***.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-**`;
    }
    if (doc.length > 4) {
      return `***.***-${doc.slice(-3)}`;
    }
    return doc;
  };

  return (
    <div className="inline-flex flex-col items-center">
      {/* Cartão Compacto estilo Crachá Vertical (54mm x 86mm proporcional) */}
      <div className="relative w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Topo Azul-Marinho com Recorte de Cordão e Marca ProntObra */}
        <div className="relative bg-gradient-to-r from-[#0F172A] via-[#0B1F3A] to-[#0F172A] px-4 pb-10 pt-3 text-white">
          {/* Furo do cordão do crachá */}
          <div className="mx-auto mb-2.5 h-2.5 w-12 rounded-full bg-slate-800 ring-1 ring-white/20" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-white">
                <HardHat className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-extrabold tracking-tight">
                Pront<span className="text-orange-500">Obra</span>
              </span>
            </div>

            {dados.verificado !== false && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                <ShieldCheck className="h-3 w-3" />
                Verificado
              </span>
            )}
          </div>
        </div>

        {/* Foto do Profissional sobreposta */}
        <div className="-mt-8 flex justify-center">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
            {dados.fotoUrl ? (
              <img
                src={dados.fotoUrl}
                alt={dados.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0F172A] text-lg font-extrabold text-orange-500">
                {dados.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Nome e Profissão */}
        <div className="px-4 pt-2 text-center">
          <h3 className="truncate text-base font-extrabold text-[#0F172A]">
            {dados.nome}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-orange-500/10 px-3 py-0.5 text-xs font-bold text-orange-600">
            {dados.profissao}
          </span>
        </div>

        {/* Dados Pessoais Compactos */}
        <div className="mt-3.5 space-y-2 border-t border-slate-100 bg-[#F8FAFC] px-4 py-3 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
              Nascimento:
            </span>
            <span className="font-bold text-[#0F172A]">
              {dados.dataNascimento}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <CreditCard className="h-3.5 w-3.5 text-orange-500" />
              {dados.documentoTipo || 'CPF'}:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#0F172A]">
                {formatarDocumentoSeguranca(dados.documentoNumero)}
              </span>
              <button
                type="button"
                onClick={() => setMostrarDocCompleto(!mostrarDocCompleto)}
                title={mostrarDocCompleto ? 'Ocultar documento' : 'Mostrar documento'}
                className="text-slate-400 hover:text-orange-500"
              >
                {mostrarDocCompleto ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              Cidade:
            </span>
            <span className="truncate max-w-[140px] font-bold text-[#0F172A]">
              {dados.cidade}
            </span>
          </div>
        </div>

        {/* Rodapé com Código de Identificação */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              ID Profissional
            </p>
            <p className="font-mono text-xs font-bold text-[#0F172A]">
              {dados.codigoRegistro || 'PO-2026-8492'}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#0F172A]">
            <QrCode className="h-5 w-5" />
          </div>
        </div>

        {/* Barra inferior laranja */}
        <div className="h-1.5 w-full bg-orange-500" />
      </div>

      {/* Botão opcional de imprimir crachá */}
      {permitirImprimir && (
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-[#0F172A] shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Salvar Crachá
        </button>
      )}
    </div>
  );
}

 