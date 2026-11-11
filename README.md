# Craserra Campestre

Site institucional do Craserra Campestre, desenvolvido com HTML, CSS e JavaScript puro.

## Arquivos

- `index.html` — estrutura e conteúdo do site; as fotografias e a logomarca fornecidas estão incorporadas no HTML.
- `style.css` — estilos, identidade visual e regras responsivas.
- `script.js` — navegação, galeria, simulação de reserva e carrossel de depoimentos.

## Executar localmente

Como o projeto é estático, basta abrir `index.html` no navegador. Para testar de forma mais próxima à hospedagem, inicie um servidor local na pasta:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie `index.html`, `style.css` e `script.js` para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`, depois salve.

## Dependências externas

- Google Fonts (Fraunces e Inter).
- GSAP 3.12.5 via CDN. O carrossel possui fallback em JavaScript caso a biblioteca não carregue.

## Observação importante sobre reservas

A área atual é um **simulador de valores e gerador de solicitação por e-mail (`mailto:`)**. Ela não consulta disponibilidade real, não registra reservas em banco de dados e não confirma hospedagens automaticamente. Para receber reservas diretamente pelo site, será necessário integrar um backend ou serviço de reservas e validar disponibilidade e preços no servidor.

## Checklist antes de publicar

- Confirme se os valores por acomodação continuam atualizados.
- Confirme telefone, e-mail, endereço e redes sociais.
- Teste os links e o formulário de reserva.
- Teste em celular, tablet e desktop.
