# Laboratório Virtual — demos de nível e vibração

**Acessar:** https://tonymarim.github.io/cmvi-demos/

Uma página inicial permite escolher entre três demonstrações interativas 3D:

- **Estação de nível:** ciclo automático de enchimento e esvaziamento, movimento da válvula e modelo original do Inventor.
- **Gêmeo virtual de vibração:** conjunto motor/bomba original, comandos virtuais, aceleração RMS, pico, frequência dominante, sinal no tempo e espectro. Um ciclo simulado de 36 s alterna vibração baixa (12 s), elevada (12 s) e redução gradual (12 s).
- **Planta SMART 4.0 N2:** quatro estações, produção de 1–3 andares, inspeção de lâminas, inventário, sinais, comandos manuais, falhas e 17 ensaios de comissionamento do modelo. Acesse [a demo N2](https://tonymarim.github.io/cmvi-demos/n2/).

A demo N2 executa o modelo inteiramente no navegador, sem servidor de controle ou chamadas `/api`. Cada visitante tem sua própria sessão; recarregar reinicia o inventário. Rastreio CSV e relatório JSON são baixados no dispositivo. Não há conexão com CLPs ou robô real. Geometria, tempos e movimentos não constituem uma réplica física calibrada. O projeto local completo está em [gemeo-digital-planta-N2](https://github.com/tonymarim/gemeo-digital-planta-N2).

Na planta N2, a roda e a pinça aplicam zoom gradual. Qualidade Alta usa a densidade da tela (até 2×), antisserrilhamento e sombras; Qualidade Econômica reduz o custo gráfico. A trajetória TCP não é desenhada automaticamente durante o movimento do robô. Após uma atualização, use Ctrl+F5 para recarregar os arquivos da demo.

Bases, lâminas e montagem acompanham a ventosa, a garra ou o garfo nas transferências. O elevador apoia o produto na prateleira antes de retornar ao Home. Os trajetos automáticos são didáticos e coincidem com os contatos da geometria reconstruída; não representam trajetórias UR calibradas.

Os sinais e movimentos são **simulados no navegador**. Não há conexão com Arduino/ESP32, aquisição real, comando de equipamento físico ou gravação em servidor. A exportação CSV salva somente a leitura simulada atual. Vibração visual ampliada e rotação ilustrativa; a frequência dominante não é uma medição de RPM. O monitor é didático e não emite diagnóstico industrial.

## Publicação

GitHub Pages serve a pasta `docs` da branch `main`. Os arquivos compilados estão incluídos para publicar sem servidor Node e sem compilação remota. `.nojekyll` preserva os arquivos estáticos. Caminhos relativos permitem executar sob `/cmvi-demos/`.

## Executar localmente

Sirva `docs/` com um servidor HTTP estático. Por exemplo, com Python:

```sh
python -m http.server 8080 --directory docs
```

Abra http://localhost:8080. Para alterar a interface 3D, edite `src/nivel`, `src/vibracao` ou `src/n2`, instale as dependências com `npm install` e recompile com `npm run build`. A página inicial é `docs/index.html`.

## QR code

- `docs/qr-demos.png`: imagem do QR code com margem branca.
- `docs/qr-demos.svg`: versão vetorial para impressão.
- `cartaz-qr-demos.png`: cartaz com o QR code.

Destino: https://tonymarim.github.io/cmvi-demos/

O PNG foi decodificado automaticamente para confirmar esse destino. O QR Code continua apontando para o mesmo portal; a planta N2 foi adicionada como uma terceira opção. Para testar o acesso público, leia com a câmera de um celular conectado ao 4G/5G, abra as três demos e confira as animações e os controles. WebGL é necessário. VR imersiva depende do navegador/dispositivo e não foi validada fisicamente nesta publicação.

## Origem

Cópias adaptadas dos projetos didáticos locais `Aula_10/Estacao-de-Nivel` e `gemeo_digital_vibracaomotor`. As funções de geração/análise do sinal e os modelos GLB foram preservados. Os projetos de aquisição real permanecem separados.

A N2 recebeu revisão visual pelas dez fotos reais de 28/10/2026: equipamento detalhado e laboratório com piso amadeirado, divisórias de vidro, janelas, TV, rack e mobiliário. Use Ambiente para a vista ampla e Sala visível/oculta para inspecionar a planta. As dimensões da sala são aproximações visuais; a simulação e os ensaios continuam locais ao navegador.
