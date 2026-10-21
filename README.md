# Laboratório Virtual — demos de nível e vibração

**Acessar:** https://tonymarim.github.io/cmvi-demos/

Uma página inicial permite escolher entre duas demonstrações interativas 3D:

- **Estação de nível:** ciclo automático de enchimento e esvaziamento, movimento da válvula e modelo original do Inventor.
- **Gêmeo virtual de vibração:** conjunto motor/bomba original, comandos virtuais, aceleração RMS, pico, frequência dominante, sinal no tempo e espectro. Um ciclo simulado de 36 s alterna vibração baixa (12 s), elevada (12 s) e redução gradual (12 s).

Os sinais e movimentos são **simulados no navegador**. Não há conexão com Arduino/ESP32, aquisição real, comando de equipamento físico ou gravação em servidor. A exportação CSV salva somente a leitura simulada atual. Vibração visual ampliada e rotação ilustrativa; a frequência dominante não é uma medição de RPM. O monitor é didático e não emite diagnóstico industrial.

## Publicação

GitHub Pages serve a pasta `docs` da branch `main`. Os arquivos compilados estão incluídos para publicar sem servidor Node e sem compilação remota. `.nojekyll` preserva os arquivos estáticos. Caminhos relativos permitem executar sob `/cmvi-demos/`.

## Executar localmente

Sirva `docs/` com um servidor HTTP estático. Por exemplo, com Python:

```sh
python -m http.server 8080 --directory docs
```

Abra http://localhost:8080. Para alterar a interface 3D, edite `src/nivel` ou `src/vibracao`, instale as dependências com `npm install` e recompile com `npm run build`. A página inicial é `docs/index.html`.

## QR code

- `docs/qr-demos.png`: imagem do QR code com margem branca.
- `docs/qr-demos.svg`: versão vetorial para impressão.
- `cartaz-qr-demos.png`: cartaz com o QR code.

Destino: https://tonymarim.github.io/cmvi-demos/

O PNG foi decodificado automaticamente para confirmar esse destino. Para testar o acesso público, leia com a câmera de um celular conectado ao 4G/5G, abra as duas demos e confira as animações e os controles. WebGL é necessário. VR imersiva depende do navegador/dispositivo e não foi validada fisicamente nesta publicação.

## Origem

Cópias adaptadas dos projetos didáticos locais `Aula_10/Estacao-de-Nivel` e `gemeo_digital_vibracaomotor`. As funções de geração/análise do sinal e os modelos GLB foram preservados. Os projetos de aquisição real permanecem separados.
