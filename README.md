<div align="center">

<h1>⚡ react-render-guard</h1>

<p><strong>Visualize re-renders. Find wasteful updates. Ship faster apps.</strong></p>

<p>
  <a href="https://www.npmjs.com/package/react-render-guard"><img src="https://img.shields.io/npm/v/react-render-guard?color=61dafb&style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/react-render-guard"><img src="https://img.shields.io/npm/dm/react-render-guard?color=4ade80&style=flat-square" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/react-render-guard?color=fb923c&style=flat-square" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/React-%3E%3D16.8-61dafb?style=flat-square&logo=react" alt="React 16.8+" />
  <img src="https://img.shields.io/badge/TypeScript-first-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/zero_deps-✓-4ade80?style=flat-square" alt="zero dependencies" />
</p>

<p>
  <a href="#-what-is-it">What is it</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-full-api">Full API</a> •
  <a href="#-playground">Playground</a> •
  <br/>
  <a href="#-o-que-é">🇧🇷 Versão em Português</a>
</p>

</div>

---

<!-- ===================================================================== -->
<!-- 🇺🇸  ENGLISH                                                           -->
<!-- ===================================================================== -->

## 🧠 What is it?

**react-render-guard** is a **performance diagnostic library** for React. It helps you **see** which components are re-rendering, how often, and **why** — right in the browser, without installing extensions or opening external tools.

### The problem it solves

> _"My app feels slow, but I can't tell which component is re-rendering too much."_

In React, a component re-renders whenever its state or props change. But sometimes re-renders happen **unnecessarily** — when the parent updates, when a function is recreated, when an object looks the same but holds a different memory reference.

react-render-guard puts a **coloured animated border** around any component that renders, and logs to the console exactly **which props or hooks changed** between two renders.

### Is it safe for production?

✅ **Yes.** The library automatically detects the environment and completely disables itself in `production`. Zero overhead in prod.

---

## 📦 Installation

```bash
# npm
npm install react-render-guard

# pnpm
pnpm add react-render-guard

# yarn
yarn add react-render-guard
```

**Requirements:** React `≥ 16.8` (Hooks support), TypeScript is optional but recommended.

---

## 🚀 Quick Start

Wrap any part of your JSX with `<RenderFlash>`:

```tsx
import { RenderFlash } from 'react-render-guard';

function MyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form>
      {/* Each field in its own RenderFlash */}
      <RenderFlash name="Field-Name">
        <input value={name} onChange={e => setName(e.target.value)} />
      </RenderFlash>

      <RenderFlash name="Field-Email">
        <input value={email} onChange={e => setEmail(e.target.value)} />
      </RenderFlash>
    </form>
  );
}
```

Now when you type in the name field, **only that field flashes** — proving the email input is not re-rendering unnecessarily. 🎉

### What do the colours mean?

| Colour | Meaning |
|--------|---------|
| 🟢 Green | Initial mount (1st render) |
| 🔵 Cyan | Few re-renders (2–3×) |
| 🟠 Orange | Moderate re-renders (4–8×) |
| 🔴 Red | Excessive re-renders (9×+) |

---

## 📖 Full API

### `<RenderFlash>` — Declarative component

The simplest way to visualise renders. Wrap any JSX with it.

```tsx
import { RenderFlash } from 'react-render-guard';

<RenderFlash
  name="MyComponent"  // identifier shown in the console and filters
  duration={400}       // animation duration in ms (default: 400)
  display="contents"   // CSS display of the wrapper (default: "contents" = layout-transparent)
>
  {/* your component here */}
</RenderFlash>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Component identifier in the console |
| `duration` | `number` | `400` | Flash animation duration in milliseconds |
| `display` | `string` | `"contents"` | CSS `display` of the transparent wrapper |
| `style` | `CSSProperties` | — | Extra styles for the wrapper |
| `className` | `string` | — | Additional CSS class |

> **Tip:** `display="contents"` makes the wrapper **invisible to layout** — it adds no extra line break or spacing. Use another value (e.g. `"block"`) only if you want to control its visual behaviour.

---

### `withRenderFlash(Component, name?)` — HOC

When you can't (or don't want to) modify a component's internal JSX, use the Higher-Order Component:

```tsx
import { withRenderFlash } from 'react-render-guard';

// Original component — untouched
function UserCard({ name, email }: Props) {
  return <div>{name} — {email}</div>;
}

// Flashing version — same API, same behaviour
const UserCardWithFlash = withRenderFlash(UserCard, 'UserCard');

// Use normally
<UserCardWithFlash name="Ana" email="ana@email.com" />
```

---

### `useFlashOnRender(name?, options?)` — Low-level hook

For maximum control, use the hook directly and attach the `ref` to the element that should flash:

```tsx
import { useFlashOnRender } from 'react-render-guard';

function MyComponent() {
  const { ref, renderCount } = useFlashOnRender('MyComponent', {
    duration: 600, // longer animation
  });

  return (
    <div ref={ref}>
      <p>Rendered {renderCount} time(s)</p>
    </div>
  );
}
```

**Return value:**

| Field | Type | Description |
|-------|------|-------------|
| `ref` | `RefObject<T>` | Attach to the HTML element that should flash |
| `renderCount` | `number` | Current render count (starts at 1) |

---

### `useRenderCheck(componentName)` — Render counter

Simply logs to the console how many times the component has rendered:

```tsx
import { useRenderCheck } from 'react-render-guard';

function Header() {
  const count = useRenderCheck('Header');
  // → [RenderGuard] Header rendered 3 times (in console)

  return <header>...</header>;
}
```

---

### `useWhyDidYouRender(name, props, hooks?)` — Deep diagnostic

The most powerful hook in the library. It **compares props and hooks** between two renders and prints a diff table in the console showing exactly what changed.

#### Tracking prop changes

```tsx
import { useWhyDidYouRender } from 'react-render-guard';

function Profile(props: { name: string; score: number; tag: object }) {
  useWhyDidYouRender('Profile', props);
  return <div>{props.name}: {props.score}</div>;
}
```

In the console, on each re-render you'll see:

```
▼ [RenderGuard] Profile #3
  📦 Changed Props
  ┌───────┬──────┬──────┐
  │ prop  │ prev │ next │
  ├───────┼──────┼──────┤
  │ score │ 0    │ 1    │
  └───────┴──────┴──────┘
```

#### Tracking hooks (useContext, useState, useReducer…)

```tsx
import { useWhyDidYouRender } from 'react-render-guard';

function Dashboard(props: Props) {
  const { theme } = useContext(ThemeCtx);
  const [open, setOpen] = useState(false);

  useWhyDidYouRender('Dashboard', props, {
    'useContext › theme': theme,
    'useState › open': open,
  });

  return <div>...</div>;
}
```

The third argument is a **label → value dictionary**. The hook compares each value between renders and reports when something changed.

**Return value:**

| Field | Type | Description |
|-------|------|-------------|
| `changedProps` | `PropChange[]` | List of props that changed |
| `changedHooks` | `HookChange[]` | List of hooks that changed |
| `summary` | `string` | Human-readable reason for the re-render |

---

### `<RenderGuard>` — Global profiler

Wraps your app with the `React.Profiler` API to measure **render time** and display a floating panel in the bottom-right corner of the screen:

```tsx
import { RenderGuard } from 'react-render-guard';

// In your root file (main.tsx or App.tsx):
<RenderGuard>
  <App />
</RenderGuard>
```

The panel shows:
- ⏱ Last render time (green / orange / red)
- 🔢 Total renders since mount
- 🏷 Which part of the tree rendered

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRenderCallback` | `ProfilerOnRenderCallback` | — | Custom callback with Profiler data |
| `threshold` | `number` | `3` | "Wasted render" alert factor |

---

### `configure(options)` — Global configuration

Call once in your app entry point to adjust global behaviour:

```tsx
import { configure } from 'react-render-guard';

configure({
  // Track only these components (empty array = all)
  only: ['Header', 'UserCard', 'Profile'],

  // Force-enable even in staging (always false in production)
  enabled: true,
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `only` | `string[]` | `[]` (all) | Allowlist of component names to track |
| `enabled` | `boolean` | `true` in dev | Global on/off switch |

> **Production:** regardless of `configure`, the library is a **complete no-op** when `NODE_ENV === 'production'`. There is zero performance cost.

---

## 🗺 Library map

```
react-render-guard
│
├── Components              (declarative JSX)
│   ├── <RenderFlash>       → flashes the border of any element
│   └── <RenderGuard>       → measures time via React.Profiler + floating panel
│
├── HOC                     (without touching internal JSX)
│   └── withRenderFlash()   → wraps any existing component
│
├── Hooks                   (maximum control)
│   ├── useFlashOnRender()  → ref + renderCount
│   ├── useRenderCheck()    → just count and log
│   └── useWhyDidYouRender()→ diff props AND hooks
│
└── Configuration
    └── configure()         → filters and global on/off
```

---

## 🎭 Common use cases

### 1. "My form is slow when typing"

```tsx
// Wrap each field to see which ones re-render
<RenderFlash name="FieldName">
  <input ... />
</RenderFlash>
<RenderFlash name="FieldEmail">
  <input ... />
</RenderFlash>
```

If all fields flash when typing in one → move the state back to each field (local state) or use `React.memo`.

### 2. "I don't know why my list re-renders every time"

```tsx
const ItemWithFlash = withRenderFlash(ListItem, 'ListItem');

// In the list:
{items.map(item => <ItemWithFlash key={item.id} {...item} />)}
```

If only one item flashes → great, isolation is working. If all flash → check whether the array reference or callback functions are being recreated in the parent.

### 3. "I want to know exactly why a specific component re-rendered"

```tsx
function UserCard(props: Props) {
  const { user } = useContext(AuthCtx);

  const { summary } = useWhyDidYouRender('UserCard', props, {
    'useContext › user': user,
  });

  // 'summary' contains readable text: "re-rendered because props: [name]"
  return <div title={summary}>...</div>;
}
```

### 4. "I want to ignore irrelevant components"

```tsx
// main.tsx
configure({ only: ['UserCard', 'Header'] });
```

Now only those two appear in the console — no noise.

---

## 🧪 Interactive Playground

Clone the repository and run the playground to see everything in action:

```bash
git clone https://github.com/alvarobianor/react-render-guard.git
cd react-render-guard/example
npm install
npm run dev
```

Open `http://localhost:5173` and explore the 6 sections:

| Section | What it demonstrates |
|---------|---------------------|
| 📝 Controlled Form | `<RenderFlash>` isolating form fields |
| 🔢 Counter Cascade | `withRenderFlash` on independent counters |
| 📋 Dynamic List | Per-item isolation in a dynamic list |
| ⚡ Isolated vs Propagated | Local state vs state lifted to parent |
| 🔍 Props Diff | `useWhyDidYouRender` with prop diff in console |
| 🪝 Hooks Tracker | `useWhyDidYouRender` tracking useState/useReducer/useContext |

---

## ❓ FAQ

**Q: Does this affect my app's performance in production?**  
A: No. In `production`, all hooks and components become immediate no-ops. Cost = zero.

**Q: Does it work with React 18 / 19 / Concurrent Mode?**  
A: Yes. Tested with React 16.8+ through 19.x.

**Q: Do I need TypeScript?**  
A: It's not required, but the library is written in TypeScript and ships full types for better autocomplete.

**Q: Will the coloured border appear in my production app?**  
A: No. The animation is only injected in `development`.

**Q: Can I use it alongside React DevTools?**  
A: Yes, they are complementary. react-render-guard is lighter and doesn't require opening the DevTools panel.

---

<br />
<br />

---

<!-- ===================================================================== -->
<!-- 🇧🇷  PORTUGUÊS                                                         -->
<!-- ===================================================================== -->

<div align="center">

<h2>🇧🇷 Documentação em Português</h2>

<p>
  <a href="#-o-que-é">O que é</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-início-rápido">Início rápido</a> •
  <a href="#-api-completa">API</a> •
  <a href="#-playground-interativo">Playground</a>
</p>

</div>

---

## 🧠 O que é?

**react-render-guard** é uma biblioteca de **diagnóstico de performance** para React. Ela ajuda você a **ver** quais componentes estão re-renderizando, com que frequência, e **por quê** — diretamente no navegador, sem precisar instalar extensões ou abrir ferramentas externas.

### O problema que ela resolve

> _"Meu app está lento, mas não sei qual componente está re-renderizando demais."_

No React, um componente re-renderiza sempre que seu estado ou props mudam. Mas às vezes re-renderizações acontecem **desnecessariamente** — quando o pai atualiza, quando uma função é recriada, quando um objeto parece igual mas não é a mesma referência em memória.

O react-render-guard coloca uma **borda colorida animada** ao redor de qualquer componente que renderizar, e registra no console exatamente **quais props ou hooks mudaram** entre dois renders.

### É seguro para produção?

✅ **Sim.** A biblioteca detecta automaticamente o ambiente e se desabilita completamente em `production`. Zero overhead em produção.

---

## 📦 Instalação

```bash
# npm
npm install react-render-guard

# pnpm
pnpm add react-render-guard

# yarn
yarn add react-render-guard
```

**Requisitos:** React `≥ 16.8` (suporte a Hooks), TypeScript opcional mas recomendado.

---

## 🚀 Início rápido

Adicione o wrapper `<RenderFlash>` ao redor de qualquer parte do seu JSX:

```tsx
import { RenderFlash } from 'react-render-guard';

function MeuFormulario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form>
      {/* Cada campo fica em seu próprio RenderFlash */}
      <RenderFlash name="Campo-Nome">
        <input value={nome} onChange={e => setNome(e.target.value)} />
      </RenderFlash>

      <RenderFlash name="Campo-Email">
        <input value={email} onChange={e => setEmail(e.target.value)} />
      </RenderFlash>
    </form>
  );
}
```

Ao digitar no campo de nome, **apenas esse campo pisca** — provando que o email não está re-renderizando desnecessariamente. 🎉

### O que as cores significam?

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Montagem inicial (1ª vez) |
| 🔵 Ciano | Poucos re-renders (2–3×) |
| 🟠 Laranja | Re-renders moderados (4–8×) |
| 🔴 Vermelho | Muitos re-renders (9×+) |

---

## 📖 API Completa

### `<RenderFlash>` — Componente declarativo

O jeito mais simples de visualizar renders. Envolva qualquer JSX com ele.

```tsx
import { RenderFlash } from 'react-render-guard';

<RenderFlash
  name="MeuComponente"   // nome exibido no console e nos filtros
  duration={400}          // duração da animação em ms (padrão: 400)
  display="contents"      // display CSS do wrapper (padrão: "contents" = transparente)
>
  {/* seu componente aqui */}
</RenderFlash>
```

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `name` | `string` | — | Identificador do componente no console |
| `duration` | `number` | `400` | Duração da animação em milissegundos |
| `display` | `string` | `"contents"` | Valor CSS de `display` do wrapper transparente |
| `style` | `CSSProperties` | — | Estilos extras para o wrapper |
| `className` | `string` | — | Classe CSS adicional |

> **Dica:** `display="contents"` faz o wrapper ser **invisível para o layout** — ele não adiciona nenhuma quebra de linha ou espaço extra. Use outro valor (ex: `"block"`) apenas se quiser controlar o comportamento visual.

---

### `withRenderFlash(Component, name?)` — HOC

Quando você não quer (ou não pode) modificar o JSX interno de um componente, use o Higher-Order Component:

```tsx
import { withRenderFlash } from 'react-render-guard';

// Componente original — sem modificação
function CartaoUsuario({ nome, email }: Props) {
  return <div>{nome} — {email}</div>;
}

// Versão com flash — mesma API, comportamento igual
const CartaoUsuarioComFlash = withRenderFlash(CartaoUsuario, 'CartaoUsuario');

// Use normalmente
<CartaoUsuarioComFlash nome="Ana" email="ana@email.com" />
```

---

### `useFlashOnRender(name?, options?)` — Hook de baixo nível

Para máximo controle, use o hook diretamente e aplique o `ref` ao elemento que deve piscar:

```tsx
import { useFlashOnRender } from 'react-render-guard';

function MeuComponente() {
  const { ref, renderCount } = useFlashOnRender('MeuComponente', {
    duration: 600,
  });

  return (
    <div ref={ref}>
      <p>Renderizou {renderCount} vez(es)</p>
    </div>
  );
}
```

**Retorno:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ref` | `RefObject<T>` | Attach ao elemento HTML que deve piscar |
| `renderCount` | `number` | Contagem atual de renders (começa em 1) |

---

### `useRenderCheck(componentName)` — Contador de renders

Registra no console quantas vezes o componente renderizou:

```tsx
import { useRenderCheck } from 'react-render-guard';

function Header() {
  const count = useRenderCheck('Header');
  // → [RenderGuard] Header rendered 3 times

  return <header>...</header>;
}
```

---

### `useWhyDidYouRender(name, props, hooks?)` — Diagnóstico profundo

O hook mais poderoso da biblioteca. Compara props e hooks entre dois renders e imprime uma tabela de diff no console.

#### Rastreando mudanças de props

```tsx
import { useWhyDidYouRender } from 'react-render-guard';

function Perfil(props: { nome: string; score: number }) {
  useWhyDidYouRender('Perfil', props);
  return <div>{props.nome}: {props.score}</div>;
}
```

#### Rastreando hooks (useContext, useState, useReducer…)

```tsx
function Painel(props: Props) {
  const { tema } = useContext(TemaCtx);
  const [aberto, setAberto] = useState(false);

  useWhyDidYouRender('Painel', props, {
    'useContext › tema': tema,
    'useState › aberto': aberto,
  });

  return <div>...</div>;
}
```

**Retorno:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `changedProps` | `PropChange[]` | Lista de props que mudaram |
| `changedHooks` | `HookChange[]` | Lista de hooks que mudaram |
| `summary` | `string` | Texto legível do motivo do re-render |

---

### `<RenderGuard>` — Profiler global

Usa `React.Profiler` para medir o tempo de cada render e exibir um painel flutuante:

```tsx
import { RenderGuard } from 'react-render-guard';

<RenderGuard>
  <App />
</RenderGuard>
```

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `onRenderCallback` | `ProfilerOnRenderCallback` | — | Callback customizado com dados do Profiler |
| `threshold` | `number` | `3` | Fator de alerta de "render desperdiçado" |

---

### `configure(options)` — Configuração global

```tsx
import { configure } from 'react-render-guard';

configure({
  only: ['Header', 'CartaoUsuario'],
  enabled: true,
});
```

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `only` | `string[]` | `[]` (todos) | Allowlist de nomes de componentes a rastrear |
| `enabled` | `boolean` | `true` em dev | Liga/desliga globalmente |

---

## 🎭 Casos de uso comuns

### 1. "Meu formulário está lento ao digitar"

```tsx
<RenderFlash name="CampoNome"><input ... /></RenderFlash>
<RenderFlash name="CampoEmail"><input ... /></RenderFlash>
```

Se todos os campos piscarem ao digitar em um → use estado local por campo ou `React.memo`.

### 2. "Não sei por que minha lista re-renderiza toda vez"

```tsx
const ItemComFlash = withRenderFlash(ItemDaLista, 'ItemDaLista');

{itens.map(item => <ItemComFlash key={item.id} {...item} />)}
```

### 3. "Quero saber exatamente por que um componente re-renderizou"

```tsx
function CartaoUsuario(props: Props) {
  const { user } = useContext(AuthCtx);

  const { summary } = useWhyDidYouRender('CartaoUsuario', props, {
    'useContext › user': user,
  });

  return <div title={summary}>...</div>;
}
```

### 4. "Quero ignorar componentes irrelevantes"

```tsx
// main.tsx
configure({ only: ['CartaoUsuario', 'Header'] });
```

---

## 🧪 Playground Interativo

```bash
git clone https://github.com/alvarobianor/react-render-guard.git
cd react-render-guard/example
npm install
npm run dev
```

Abra `http://localhost:5173` e explore as 6 seções:

| Seção | O que demonstra |
|-------|----------------|
| 📝 Controlled Form | `<RenderFlash>` isolando campos de formulário |
| 🔢 Counter Cascade | `withRenderFlash` em contadores independentes |
| 📋 Dynamic List | Isolamento por item em uma lista dinâmica |
| ⚡ Isolated vs Propagated | Estado local vs estado elevado ao pai |
| 🔍 Props Diff | `useWhyDidYouRender` com diff de props no console |
| 🪝 Hooks Tracker | `useWhyDidYouRender` rastreando useState/useReducer/useContext |

---

## ❓ Perguntas Frequentes

**P: Isso afeta a performance do meu app em produção?**  
R: Não. Em `production`, todos os hooks e componentes são no-op imediatos. Custo = zero.

**P: Funciona com React 18 / 19 / Concurrent Mode?**  
R: Sim. Testado com React 16.8+ até 19.x.

**P: Preciso de TypeScript?**  
R: Não é obrigatório, mas a biblioteca é escrita em TypeScript e fornece tipos completos.

**P: A borda colorida aparece no app de produção?**  
R: Não. A animação só é injetada em `development`.

**P: Posso usar junto com React DevTools?**  
R: Sim, são complementares.

---

## 📝 Licença

[MIT](./LICENSE) © [Álvaro Bianor](https://github.com/alvarobianor)
