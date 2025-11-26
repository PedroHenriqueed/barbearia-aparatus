## Tarefa
Criar um sheet de cancelamento de reserva que é exibido quando o usuário clica no @app\_components\booking-item.tsx
A interface deve ser EXATAMENTE a que está no Figma em https://www.figma.com/design/dZEWQn0JIIiUGbetxncRIH/Aparatus-%7C-Alunos--Copy-?node-id=78-2076&t=zuJ7jKNlxd1mrZd8-4
Ao clicar no botão de "Cancelar Reserva" a reserva deverá ser cancelada

## Requisitos Tecnicos
Use o Sheet do shadcn/ui
Crie um server action de cancelar reserva chamada "cancel-booking" que recebe o ID da reserva e define booking.cancelled = true
Os dados exibidos no Sheet devem ser os mesmos dados do agendamento clicado
Status é confirmado se agendamento é no futuro e finalizado se é no passado

## Server Actions
SEMPRE use a biblioteca "next-safe-action" pkara criar Server Actions.
SEMPRE use o hook "useAction" da biblioteca "next-safe-action" para chamar uma Server Action
SEMPRE faça validações de autorização e autenticação em uma Server Action conforme o usuário
SEMPRE crie as server actions na pasta @app\_actions
