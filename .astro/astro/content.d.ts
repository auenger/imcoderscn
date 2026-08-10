declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"agentszone.md": {
	id: "agentszone.md";
  slug: "agentszone";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"ai-agent-engineering.md": {
	id: "ai-agent-engineering.md";
  slug: "ai-agent-engineering";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"ai-catfish-transformation.md": {
	id: "ai-catfish-transformation.md";
  slug: "ai-catfish-transformation";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"ai-framework-comparison.md": {
	id: "ai-framework-comparison.md";
  slug: "ai-framework-comparison";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"anyclaw-agent-first-future.md": {
	id: "anyclaw-agent-first-future.md";
  slug: "anyclaw-agent-first-future";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"anyclaw-security-skill-design.md": {
	id: "anyclaw-security-skill-design.md";
  slug: "anyclaw-security-skill-design";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"context-management-is-the-real-skill.md": {
	id: "context-management-is-the-real-skill.md";
  slug: "context-management-is-the-real-skill";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"database-agent-chat2db-work-os.md": {
	id: "database-agent-chat2db-work-os.md";
  slug: "database-agent-chat2db-work-os";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"domain-expert-agent-ecosystem.md": {
	id: "domain-expert-agent-ecosystem.md";
  slug: "domain-expert-agent-ecosystem";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"edith-agent.md": {
	id: "edith-agent.md";
  slug: "edith-agent";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"enterprise-ai-transformation-pitfalls.md": {
	id: "enterprise-ai-transformation-pitfalls.md";
  slug: "enterprise-ai-transformation-pitfalls";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"fde-china-kernel.md": {
	id: "fde-china-kernel.md";
  slug: "fde-china-kernel";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"fde-million-salary.md": {
	id: "fde-million-salary.md";
  slug: "fde-million-salary";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"feature-workflow-v3.md": {
	id: "feature-workflow-v3.md";
  slug: "feature-workflow-v3";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"feature-workflow.md": {
	id: "feature-workflow.md";
  slug: "feature-workflow";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"harness-engineering-training.md": {
	id: "harness-engineering-training.md";
  slug: "harness-engineering-training";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"hermes-agent-memory-context.md": {
	id: "hermes-agent-memory-context.md";
  slug: "hermes-agent-memory-context";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"human-agent-collaboration-work-os.md": {
	id: "human-agent-collaboration-work-os.md";
  slug: "human-agent-collaboration-work-os";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"lark-cli-agent2agent.md": {
	id: "lark-cli-agent2agent.md";
  slug: "lark-cli-agent2agent";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"mate-agent-context-optimization.md": {
	id: "mate-agent-context-optimization.md";
  slug: "mate-agent-context-optimization";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"neuro-ide.md": {
	id: "neuro-ide.md";
  slug: "neuro-ide";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"thingjs-architecture-testing.md": {
	id: "thingjs-architecture-testing.md";
  slug: "thingjs-architecture-testing";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"visual-replay-tester.md": {
	id: "visual-replay-tester.md";
  slug: "visual-replay-tester";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"voice-agent-cascaded-full-duplex.md": {
	id: "voice-agent-cascaded-full-duplex.md";
  slug: "voice-agent-cascaded-full-duplex";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"welcome.md": {
	id: "welcome.md";
  slug: "welcome";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
};
"podcast": {
"ai-agent-future.md": {
	id: "ai-agent-future.md";
  slug: "ai-agent-future";
  body: string;
  collection: "podcast";
  data: any
} & { render(): Render[".md"] };
"lark-cli-agent2agent.md": {
	id: "lark-cli-agent2agent.md";
  slug: "lark-cli-agent2agent";
  body: string;
  collection: "podcast";
  data: any
} & { render(): Render[".md"] };
"neuro-ide-design.md": {
	id: "neuro-ide-design.md";
  slug: "neuro-ide-design";
  body: string;
  collection: "podcast";
  data: any
} & { render(): Render[".md"] };
"visual-testing.md": {
	id: "visual-testing.md";
  slug: "visual-testing";
  body: string;
  collection: "podcast";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
