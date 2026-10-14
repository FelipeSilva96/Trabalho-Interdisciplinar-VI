# Aplicativo Classifica Resíduo

Aplicativo do TI6 feito com Expo e React Native. Ele permite tirar uma foto ou escolher uma imagem da galeria e pedir a classificação de um resíduo.

## Como iniciar

Instale Node.js LTS. Na pasta `frontEnd` execute:

```bash
npm ci
```

Crie um arquivo `.env` nesta mesma pasta:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

Substitua o IP pelo endereço IPv4 do computador onde o backend Java está rodando (veja `ipconfig` no Windows ou `hostname -I` no Linux).

```bash
npx expo start -c
```

Abra o aplicativo usando Expo Go no celular. O celular deve conseguir acessar o computador na rede. O endereço `localhost` não funciona no celular físico, pois aponta para o próprio telefone.

## Fluxo de classificação

1. Tirar uma foto ou escolher da galeria.
2. Confirmar a imagem.
3. Enviar ao backend usando HTTP REST.
4. Receber a categoria e a confiança do classificador.
5. Exibir a resposta de forma amigável.

O aplicativo faz a requisição `POST /api/v1/classifications?strategy=distributed&protocol=grpc`. Ele se comunica por REST com Java, que encaminha internamente as imagens para os workers usando gRPC.

Sem o modelo treinado, o servidor pode responder `MODEL_NOT_LOADED`. Nesse caso, a tela informa que a classificação ainda não está disponível, em vez de mostrar um resultado inventado.

Para testar rapidamente se o servidor está acessível pelo celular, abra no navegador dele `http://IP_DO_PC:8080/api/v1/health`.
