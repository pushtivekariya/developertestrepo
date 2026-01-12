interface ClientData {
  agency_name: string;
  city: string;
  state: string;
}

export function injectClientData(text: string | null, clientData: ClientData | null): string {
  if (!text) return '';
  if (!clientData) return text;
  
  return text
    .replace(/\{agency_name\}/g, clientData.agency_name)
    .replace(/\{city\}/g, clientData.city)
    .replace(/\{state\}/g, clientData.state);
}

export function stripHtmlTags(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatGlossaryContent(text: string, term: string): string {
  if (!text) return '';
  
  const termRegex = new RegExp(`(${term})`, 'gi');
  
  const processedText = text.replace(
    termRegex,
    (match) => `<strong class="font-semibold text-navy">${match}</strong>`
  );
  
  const lines = processedText.split('\n').map(line => line.trim()).filter(line => line);
  let htmlContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line && !line.includes('.') && lines[i + 1] && lines[i + 1] !== line) {
      if (i === 0 && line.toLowerCase().includes(term.toLowerCase())) {
        continue;
      }
      htmlContent += `<h3 class="text-lg font-heading font-semibold text-navy mt-6 mb-3">${line}</h3>`;
    } else if (line) {
      htmlContent += `<p class="mb-4 leading-relaxed text-[#5C4B51]">${line}</p>`;
    }
  }
  
  return htmlContent;
}
