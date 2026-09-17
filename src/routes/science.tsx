import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioWaveform, Brain, Move, Shapes, Speech, Users, type LucideIcon } from "lucide-react";
import { Eyebrow, Mascot, Page } from "../components/site-shell";

export const Route = createFileRoute("/science")({
  head: () => ({ meta: [
    { title: "The Science — Shape My Sound" }, { name: "description", content: "Discover how sound, shape, and movement support confident expression." },
    { property: "og:title", content: "The Science — Shape My Sound" }, { property: "og:description", content: "Discover how multisensory play supports young voices." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: SciencePage,
});

function SciencePage() {
  const steps: Array<[LucideIcon,string,string]> = [[AudioWaveform,"Sound","A spoken sound — a soft “mmm” or a sharp “kee.”"],[Shapes,"Shape","The sound becomes a shape: round for Bouba, spiky for Kiki."],[Move,"Movement","The child traces and moves with the shape, linking body to sound."],[Speech,"Expression","Sound, shape, and motion combine into confident speech."]];
  return <Page>
    <section className="page-hero"><Eyebrow>The science</Eyebrow><h1>Why sound, shape, and movement<br className="hidden sm:block"/> belong together</h1><p>Shape My Sound is built on a well-studied quirk of human perception — and on the science of how children learn best: through play and their whole bodies.</p></section>
    <section className="section page-shell text-center"><Eyebrow>The multisensory path</Eyebrow><h2>From a single sound to confident expression</h2><div className="path-grid">{steps.map(([Icon,title,copy],i)=><article key={title} className="path-step"><span className="step-icon"><Icon/></span><span className="step-number">0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="band"><div className="page-shell split"><div><Eyebrow>The Bouba / Kiki effect</Eyebrow><h2>A shape for every sound</h2><p>Show people a rounded blob and a spiky star, then ask which is “Bouba” and which is “Kiki.” Across cultures and languages, almost everyone agrees: the round one is Bouba, the spiky one is Kiki.</p><p>That shared instinct reveals a deep link between what we hear and what we see. Shape My Sound uses it to give abstract sounds a friendly, visible form children can recognize, trace, and master.</p></div><div className="character-pair"><article className="character-card"><Mascot small/><h3>“Bouba”</h3><p>soft · round · slow</p></article><article className="character-card"><Mascot kind="kiki" small/><h3 className="text-violet">“Kiki”</h3><p>sharp · spiky · quick</p></article></div></div></section>
    <section className="section page-shell text-center"><Eyebrow>Principles</Eyebrow><h2>What guides every design choice</h2><div className="feature-grid">{([{icon:Brain,title:"Cross-modal learning",copy:"Engaging sound, sight, and movement together builds stronger, more durable memories than sound alone."},{icon:Move,title:"Play over pressure",copy:"Low-stakes play lowers anxiety, and a calm nervous system is far more ready to learn and take risks."},{icon:Users,title:"Therapist-informed",copy:"Every interaction is shaped with speech-language professionals to stay safe, gentle, and effective."}]).map(({icon:Icon,title,copy})=><article className="feature-card" key={title}><span className="feature-icon"><Icon/></span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="cta-strip"><h2>Curious how this works for your child or community?</h2><Link to="/practice" className="button button-sun">Try a demo</Link></div></section>
  </Page>;
}