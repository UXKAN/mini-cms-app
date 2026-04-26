import { PageHeader } from "./PageHeader";

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 0,
        }}
      >
        <PageHeader title={title} subtitle={subtitle} />
        {action && <div style={{ paddingBottom: 24 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}
