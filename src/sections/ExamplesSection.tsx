import { SectionTag } from "@/components/SectionTag";
import { CodeBlock } from "@/components/CodeBlock";

const EXAMPLES = [
  {
    title: "Custom shortcut",
    desc: "Override the default ⌘K with any combination.",
    code: `<SpotlightProvider actions={actions} shortcut="mod+shift+p">\n  <App />\n</SpotlightProvider>`,
  },
  {
    title: "Dynamic actions from Redux / context",
    desc: "Compute actions inside a hook to access store data.",
    code: `const useSpotlightActions = () => {\n  const user = useAppSelector(s => s.user);\n  const navigate = useNavigate();\n\n  return useMemo(() => [\n    {\n      id: 'profile',\n      label: \`\${user.name}'s Profile\`,\n      onSelect: () => navigate('/profile'),\n    },\n  ], [user.name, navigate]);\n};`,
  },
  {
    title: "Trigger UI via custom event",
    desc: "Trigger UI elements (like a hidden file input) from spotlight without prop drilling.",
    code: `// In your action:\nonSelect: () => document.dispatchEvent(new CustomEvent('spotlight:change-photo'))\n\n// In your Header component:\nuseEffect(() => {\n  const handler = () => photoInputRef.current?.click();\n  document.addEventListener('spotlight:change-photo', handler);\n  return () => document.removeEventListener('spotlight:change-photo', handler);\n}, []);`,
  },
] as const;

export function ExamplesSection() {
  return (
    <section id="Examples" className="py-[60px] pb-[100px]">
      <SectionTag>Examples</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-2">
        Common patterns
      </h2>
      <p className="text-muted-foreground mb-10 text-[15px]">
        Copy-paste patterns for real-world usage.
      </p>

      <div className="flex flex-col gap-10">
        {EXAMPLES.map(({ title, desc, code }) => (
          <div key={title}>
            <h3 className="text-base font-semibold mb-1.5 tracking-[-0.01em]">
              {title}
            </h3>
            <p className="text-muted-foreground text-[13px] mb-3.5">{desc}</p>
            <CodeBlock lang="tsx" code={code} />
          </div>
        ))}
      </div>
    </section>
  );
}
