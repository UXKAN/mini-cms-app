import type { MarketingContent } from "../_content/types";
import { SectionHeading } from "./SectionHeading";
import { RecognitionTabs } from "./RecognitionTabs";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["recognition"];
};

export function RecognitionSection({ content }: Props) {
  return (
    <section className="mx-auto mt-24 max-w-6xl scroll-mt-28 px-6">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        intro={content.intro}
      />
      <Reveal>
        <RecognitionTabs content={content} />
      </Reveal>
    </section>
  );
}
