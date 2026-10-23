from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'docs/index.html'
s=p.read_text(encoding='utf-8')
s=s.replace('Explore a estação de nível e a vibração do motor em duas demonstrações 3D interativas.','Explore nível, vibração e a planta SMART 4.0 N2 em três demonstrações 3D interativas.')
s=s.replace('Laboratório Virtual · Nível e Vibração','Laboratório Virtual · Nível, Vibração e Planta N2')
s=s.replace('DUAS EXPERIÊNCIAS · DIRETO NO NAVEGADOR','TRÊS EXPERIÊNCIAS · DIRETO NO NAVEGADOR')
s=s.replace('os sinais de duas estações didáticas','os sinais de estações didáticas e de uma linha de manufatura')
s=s.replace('grid-template-columns:1fr 1fr;gap:24px','grid-template-columns:repeat(3,minmax(0,1fr));gap:24px')
if 'href="./n2/"' not in s:
 card='''<a class="experience" href="./n2/"><div class="art"><span class="number">03 / PLANTA N2</span><img src="./n2-preview.png" alt="Quatro estações da planta SMART 4.0 N2 em 3D" style="width:100%;height:100%;object-fit:cover" loading="lazy"></div><div class="copy"><h2>Planta SMART 4.0 N2</h2><p>Produza blocos de até três andares. Explore estoque, processo, montagem e expedição; teste sinais, falhas e intertravamentos.</p><div class="cta">Explorar planta N2 <span>↗</span></div></div></a>
'''
 s=s.replace('</section><p class="note">',card+'</section><p class="note">')
s=s.replace('Ambiente didático · Nível & Vibração','Ambiente didático · Nível, Vibração & Planta N2')
s=s.replace('sem conexão com Arduino, ESP32 ou equipamento físico','sem conexão com Arduino, ESP32, CLPs, robô ou equipamento físico')
p.write_text(s,encoding='utf-8')
