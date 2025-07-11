import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn } from "lucide-react";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

// Função para converter BBCode básico para HTML
const parseBBCode = (text: string): string => {
  if (!text) return text;
  
  let parsed = text;
  
  // Conversões básicas de BBCode para HTML
  const bbcodeRules = [
    // Formatação básica de texto
    { regex: /\[b\](.*?)\[\/b\]/gi, replacement: '<strong>$1</strong>' },
    { regex: /\[i\](.*?)\[\/i\]/gi, replacement: '<em>$1</em>' },
    { regex: /\[u\](.*?)\[\/u\]/gi, replacement: '<u>$1</u>' },
    { regex: /\[s\](.*?)\[\/s\]/gi, replacement: '<s>$1</s>' },
    { regex: /\[strike\](.*?)\[\/strike\]/gi, replacement: '<s>$1</s>' },
    
    // Subscrito e sobrescrito (muito usado em medicina)
    { regex: /\[sup\](.*?)\[\/sup\]/gi, replacement: '<sup>$1</sup>' },
    { regex: /\[sub\](.*?)\[\/sub\]/gi, replacement: '<sub>$1</sub>' },
    
    // URLs e links
    { regex: /\[url=(.*?)\](.*?)\[\/url\]/gi, replacement: '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>' },
    { regex: /\[url\](.*?)\[\/url\]/gi, replacement: '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>' },
    { regex: /\[email=(.*?)\](.*?)\[\/email\]/gi, replacement: '<a href="mailto:$1">$2</a>' },
    { regex: /\[email\](.*?)\[\/email\]/gi, replacement: '<a href="mailto:$1">$1</a>' },
    
    // Suporte avançado para imagens com atributos
    { 
      regex: /\[img\s+width=(\d+)(?:\s+height=(\d+))?\](.*?)\[\/img\]/gi, 
      replacement: (match: string, width: string, height: string, src: string) => {
        const cleanSrc = src.startsWith('//') ? `https:${src}` : src;
        const heightAttr = height ? ` height="${height}"` : '';
        return `<img src="${cleanSrc}" alt="Imagem" width="${width}"${heightAttr} style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
      }
    },
    { 
      regex: /\[img\s+height=(\d+)(?:\s+width=(\d+))?\](.*?)\[\/img\]/gi, 
      replacement: (match: string, height: string, width: string, src: string) => {
        const cleanSrc = src.startsWith('//') ? `https:${src}` : src;
        const widthAttr = width ? ` width="${width}"` : '';
        return `<img src="${cleanSrc}" alt="Imagem" height="${height}"${widthAttr} style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
      }
    },
    { 
      regex: /\[img\](.*?)\[\/img\]/gi, 
      replacement: (match: string, src: string) => {
        const cleanSrc = src.startsWith('//') ? `https:${src}` : src;
        return `<img src="${cleanSrc}" alt="Imagem" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
      }
    },
    
    // Cores e tamanhos
    { regex: /\[color=(.*?)\](.*?)\[\/color\]/gi, replacement: '<span style="color: $1;">$2</span>' },
    { regex: /\[size=(.*?)\](.*?)\[\/size\]/gi, replacement: '<span style="font-size: $1;">$2</span>' },
    { regex: /\[font=(.*?)\](.*?)\[\/font\]/gi, replacement: '<span style="font-family: $1;">$2</span>' },
    
    // Alinhamentos
    { regex: /\[center\](.*?)\[\/center\]/gi, replacement: '<div style="text-align: center;">$1</div>' },
    { regex: /\[left\](.*?)\[\/left\]/gi, replacement: '<div style="text-align: left;">$1</div>' },
    { regex: /\[right\](.*?)\[\/right\]/gi, replacement: '<div style="text-align: right;">$1</div>' },
    { regex: /\[justify\](.*?)\[\/justify\]/gi, replacement: '<div style="text-align: justify;">$1</div>' },
    
    // Citações e código
    { regex: /\[quote\](.*?)\[\/quote\]/gi, replacement: '<blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin: 1rem 0; font-style: italic;">$1</blockquote>' },
    { regex: /\[quote=(.*?)\](.*?)\[\/quote\]/gi, replacement: '<blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin: 1rem 0; font-style: italic;"><strong>$1 disse:</strong><br>$2</blockquote>' },
    { regex: /\[code\](.*?)\[\/code\]/gi, replacement: '<pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto;"><code>$1</code></pre>' },
    
    // Listas - primeira versão (com [list])
    { regex: /\[list\](.*?)\[\/list\]/gis, replacement: '<ul style="margin: 1rem 0; padding-left: 2rem;">$1</ul>' },
    { regex: /\[list=1\](.*?)\[\/list\]/gis, replacement: '<ol style="margin: 1rem 0; padding-left: 2rem;">$1</ol>' },
    
    // Listas - segunda versão (com [ul]/[ol])
    { regex: /\[ul\](.*?)\[\/ul\]/gis, replacement: '<ul style="margin: 1rem 0; padding-left: 2rem;">$1</ul>' },
    { regex: /\[ol\](.*?)\[\/ol\]/gis, replacement: '<ol style="margin: 1rem 0; padding-left: 2rem;">$1</ol>' },
    
    // Itens de lista - múltiplas variações
    { regex: /\[li\](.*?)\[\/li\]/gi, replacement: '<li>$1</li>' },
    { regex: /\[\*\](.*?)(?=\[\*\]|\[\/list\]|\[\/ol\]|\[\/ul\]|\[li\]|$)/gi, replacement: '<li>$1</li>' },
    
    // Tabelas básicas
    { regex: /\[table\](.*?)\[\/table\]/gi, replacement: '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">$1</table>' },
    { regex: /\[tr\](.*?)\[\/tr\]/gi, replacement: '<tr>$1</tr>' },
    { regex: /\[td\](.*?)\[\/td\]/gi, replacement: '<td style="border: 1px solid #ddd; padding: 8px;">$1</td>' },
    { regex: /\[th\](.*?)\[\/th\]/gi, replacement: '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; font-weight: bold;">$1</th>' },
    
    // Spoiler/hidden content
    { regex: /\[spoiler\](.*?)\[\/spoiler\]/gi, replacement: '<details style="margin: 1rem 0;"><summary style="cursor: pointer; font-weight: bold;">Clique para revelar</summary><div style="padding: 1rem; background: #f9f9f9; border-radius: 4px; margin-top: 0.5rem;">$1</div></details>' },
    { regex: /\[spoiler=(.*?)\](.*?)\[\/spoiler\]/gi, replacement: '<details style="margin: 1rem 0;"><summary style="cursor: pointer; font-weight: bold;">$1</summary><div style="padding: 1rem; background: #f9f9f9; border-radius: 4px; margin-top: 0.5rem;">$2</div></details>' },
    
    // Destaque e caixas
    { regex: /\[highlight\](.*?)\[\/highlight\]/gi, replacement: '<mark style="background-color: yellow; padding: 2px 4px;">$1</mark>' },
    { regex: /\[box\](.*?)\[\/box\]/gi, replacement: '<div style="border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 4px; background: #f9f9f9;">$1</div>' },
    
    // Quebras de linha
    { regex: /\[br\]/gi, replacement: '<br>' },
    { regex: /\[hr\]/gi, replacement: '<hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">' },
    
    // Vídeos do YouTube (básico)
    { regex: /\[youtube\](.*?)\[\/youtube\]/gi, replacement: '<div style="margin: 1rem 0;"><iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen style="max-width: 100%; height: auto;"></iframe></div>' },
    { regex: /\[video\](.*?)\[\/video\]/gi, replacement: '<video controls style="max-width: 100%; height: auto; margin: 1rem 0;"><source src="$1">Seu navegador não suporta o elemento de vídeo.</video>' },
  ];
  
  bbcodeRules.forEach(rule => {
    if (typeof rule.replacement === 'function') {
      parsed = parsed.replace(rule.regex, rule.replacement);
    } else {
      parsed = parsed.replace(rule.regex, rule.replacement);
    }
  });
  
  // Limpeza de BBcodes órfãos ou malformados que sobraram
  // Limpar tags de abertura órfãs
  parsed = parsed.replace(/\[(?!\/)[a-zA-Z][a-zA-Z0-9]*(?:=[^\]]*)?(?:\s+[a-zA-Z][a-zA-Z0-9]*=[^\]]*)*\]/gi, '');
  
  // Limpar tags de fechamento órfãs
  parsed = parsed.replace(/\[\/[a-zA-Z][a-zA-Z0-9]*\]/gi, '');
  
  // Limpar tags isoladas como [*] que não foram processadas
  parsed = parsed.replace(/\[\*\]/gi, '');
  
  // Normalizar espaços múltiplos
  parsed = parsed.replace(/\s+/g, ' ').trim();
  
  return parsed;
};

// Detectar se o conteúdo é principalmente Markdown
const isMarkdown = (text: string): boolean => {
  if (!text) return false;
  
  const markdownPatterns = [
    /#{1,6}\s+/, // Headers
    /\*\*.*?\*\*/, // Bold
    /\*.*?\*/, // Italic
    /`.*?`/, // Code
    /\[.*?\]\(.*?\)/, // Links
    /^\s*[-*+]\s+/m, // Lists
    /^\s*\d+\.\s+/m, // Numbered lists
    />\s+/, // Blockquotes
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

// Detectar se o conteúdo contém BBCode
const isBBCode = (text: string): boolean => {
  if (!text) return false;
  
  // Padrões de BBCode comuns para melhor detecção
  const bbcodePatterns = [
    /\[\/?\w+(?:\s+\w+=[^[\]]*)?(?:=[^[\]]*)??\]/i, // Padrão geral
    /\[\*\]/i, // Item de lista
    /\[li\]|\[\/li\]/i, // Itens de lista com tags completas
    /\[ul\]|\[\/ul\]|\[ol\]|\[\/ol\]/i, // Listas ordenadas/não ordenadas
    /\[b\]|\[i\]|\[u\]|\[s\]|\[strike\]/i, // Formatação básica
    /\[sup\]|\[sub\]/i, // Sobrescrito/subscrito
    /\[color=|\[size=|\[font=/i, // Atributos
    /\[quote\]|\[code\]|\[list\]/i, // Blocos
    /\[img\]|\[url\]|\[email\]/i, // Links e imagens
    /\[table\]|\[tr\]|\[td\]|\[th\]/i, // Tabelas
    /\[center\]|\[left\]|\[right\]|\[justify\]/i, // Alinhamentos
    /\[spoiler\]|\[highlight\]|\[box\]/i, // Especiais
    /\[br\]|\[hr\]/i, // Quebras
    /\[youtube\]|\[video\]/i, // Mídia
  ];
  
  return bbcodePatterns.some(pattern => pattern.test(text));
};

// Detectar se o conteúdo contém HTML
const isHTML = (text: string): boolean => {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
};

// Estilos CSS para elementos do RichTextRenderer
const richTextStyles = `
  .rich-text img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border: 1px solid hsl(var(--border));
    margin: 1rem auto;
    display: block;
    cursor: zoom-in;
    transition: all 0.3s ease;
  }
  
  .rich-text img:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    transform: translateY(-2px) scale(1.02);
    transition: all 0.3s ease;
  }
  
  .dark .rich-text img {
    border: 1px solid hsl(var(--border));
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .dark .rich-text img:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  
  /* Tabelas */
  .rich-text table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    font-size: 0.9em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .rich-text table th {
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
    font-weight: 600;
    padding: 12px;
    text-align: left;
    border-bottom: 2px solid hsl(var(--border));
  }
  
  .rich-text table td {
    padding: 10px 12px;
    border-bottom: 1px solid hsl(var(--border));
  }
  
  .rich-text table tr:hover {
    background-color: hsl(var(--muted) / 0.5);
  }
  
  /* Spoilers/Details */
  .rich-text details {
    margin: 1rem 0;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    overflow: hidden;
  }
  
  .rich-text details summary {
    background-color: hsl(var(--muted));
    padding: 12px 16px;
    cursor: pointer;
    font-weight: 600;
    color: hsl(var(--foreground));
    user-select: none;
    transition: background-color 0.2s ease;
  }
  
  .rich-text details summary:hover {
    background-color: hsl(var(--muted) / 0.8);
  }
  
  .rich-text details[open] summary {
    border-bottom: 1px solid hsl(var(--border));
  }
  
  .rich-text details div {
    padding: 16px;
    background-color: hsl(var(--card));
  }
  
  /* Subscrito e sobrescrito */
  .rich-text sup, .rich-text sub {
    font-size: 0.75em;
    line-height: 0;
    position: relative;
  }
  
  .rich-text sup {
    vertical-align: super;
  }
  
  .rich-text sub {
    vertical-align: sub;
  }
  
  /* Destaque */
  .rich-text mark {
    background-color: #fef08a;
    color: #713f12;
    padding: 2px 4px;
    border-radius: 4px;
  }
  
  .dark .rich-text mark {
    background-color: #a3a019;
    color: #fef3c7;
  }
  
  /* Caixas */
  .rich-text div[style*="border"] {
    border-color: hsl(var(--border)) !important;
    background-color: hsl(var(--muted) / 0.3) !important;
    color: hsl(var(--foreground));
  }
  
  /* Blockquotes melhorados */
  .rich-text blockquote {
    border-left: 4px solid hsl(var(--primary));
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    background-color: hsl(var(--muted) / 0.3);
    padding: 1rem;
    border-radius: 0 8px 8px 0;
  }
  
  /* Código melhorado */
  .rich-text pre {
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  .rich-text code {
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  /* Vídeos responsivos */
  .rich-text iframe, .rich-text video {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  /* HR melhorado */
  .rich-text hr {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, hsl(var(--border)), transparent);
    margin: 2rem 0;
  }
`;

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!content) {
    return <p className={`text-muted-foreground italic ${className}`}>Nenhuma explicação disponível para esta questão.</p>;
  }

  // Função para adicionar funcionalidade de zoom às imagens
  const addImageZoomHandlers = (htmlContent: string): string => {
    return htmlContent.replace(
      /<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi,
      (match, before, src, after) => {
        return `<img${before}src="${src}"${after} style="cursor: zoom-in;" data-zoom-src="${src}" onclick="window.openImageZoom('${src}')">`;
      }
    );
  };

  // Adicionar função global para abrir zoom (será chamada pelo onclick inline)
  React.useEffect(() => {
    (window as any).openImageZoom = (src: string) => {
      setZoomedImage(src);
    };
    
    return () => {
      delete (window as any).openImageZoom;
    };
  }, []);

  // Adicionar suporte para tecla ESC para fechar o modal
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && zoomedImage) {
        setZoomedImage(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [zoomedImage]);

  // Determinar o tipo de conteúdo e processar adequadamente
  let processedContent = content;
  let renderAsMarkdown = false;

  if (isBBCode(content)) {
    // Converter BBCode para HTML
    processedContent = parseBBCode(content);
    // Adicionar handlers de zoom às imagens
    processedContent = addImageZoomHandlers(processedContent);
  } else if (isMarkdown(content)) {
    // Usar componente Markdown
    renderAsMarkdown = true;
  } else if (isHTML(content)) {
    // Sanitizar HTML existente com mais permissões para imagens e novos BBcodes
    processedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'b', 'i', 'u', 's', 'strong', 'em', 'p', 'br', 'a', 'img', 'ul', 'ol', 'li', 
        'blockquote', 'code', 'pre', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'sup', 'sub', 'mark', 'details', 'summary', 'table', 'tr', 'td', 'th', 'thead', 
        'tbody', 'hr', 'iframe', 'video', 'source'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'target', 'rel', 'style', 'class', 'width', 'height', 'title',
        'controls', 'frameborder', 'allowfullscreen', 'open', 'onclick', 'data-zoom-src'
      ]
    });
    // Adicionar handlers de zoom às imagens
    processedContent = addImageZoomHandlers(processedContent);
  }

  if (renderAsMarkdown) {
    return (
      <>
        <style>{richTextStyles}</style>
        <div className={`rich-text prose prose-slate dark:prose-invert prose-sm max-w-none ${className}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...props }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline"
                  {...props}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt, ...props }) => {
                const cleanSrc = src?.startsWith('//') ? `https:${src}` : src;
                return (
                  <div className="my-4 text-center">
                    <div className="relative inline-block group">
                      <img 
                        src={cleanSrc} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg shadow-lg border border-border/20 mx-auto transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-zoom-in"
                        style={{ maxWidth: '100%', height: 'auto' }}
                        onClick={() => setZoomedImage(cleanSrc || '')}
                        {...props}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-black/50 text-white p-1 rounded-full">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    {alt && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{alt}</p>
                    )}
                  </div>
                );
              },
              code: ({ children, ...props }) => (
                <code 
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ),
              pre: ({ children, ...props }) => (
                <pre 
                  className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono"
                  {...props}
                >
                  {children}
                </pre>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote 
                  className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
                  {...props}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Modal de Zoom para Imagens */}
        <Dialog open={!!zoomedImage}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-0 [&>button]:hidden">
            <div className="relative flex items-center justify-center min-h-[50vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
                onClick={() => setZoomedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              {zoomedImage && (
                <img
                  src={zoomedImage}
                  alt="Imagem ampliada"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Renderizar HTML sanitizado
  return (
    <>
      <style>{richTextStyles}</style>
      <div 
        className={`rich-text prose prose-slate dark:prose-invert prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        style={{
          lineHeight: '1.6',
          color: 'hsl(var(--foreground))',
        }}
      />

      {/* Modal de Zoom para Imagens */}
      <Dialog open={!!zoomedImage}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-0 [&>button]:hidden">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            {zoomedImage && (
              <img
                src={zoomedImage}
                alt="Imagem ampliada"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 