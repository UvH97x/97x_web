
//////////////////////////////////////////////////////////////////////
// Lv.4
export interface Text {
  type: "text";
  content: {
    expression: string;
    style: string;
  };
  children: [];
}

type Lv4Block = Text;

//////////////////////////////////////////////////////////////////////
// Lv.3
export interface Math {
  type: "math";
  content: {
    id: string;
    expression: string;
  };
  children: [];
}

export interface Code {
  type: "code";
  content: {
    id: string;
    language: string;
    code: string;
  };
  children: [];
}

export interface Image {
  type: "image";
  content: {
    id: string;
    caption: string;
    src: string;
  };
  children: [];
}

export interface Table {
  type: "table";
  content: {
    id: string;
    caption: string;
    cells: string[][];
  };
  children: [];
}

type Lv3Block = Math | Code | Image | Table | Lv4Block;

//////////////////////////////////////////////////////////////////////
// Lv.2
export interface Paragraph {
  type: "paragraph";
  content: {};
  children: Lv2Block[];
}

export interface Fold {
  type: "fold";
  content: {
    alt: string;
  };
  children: Lv2Block[];
}

export interface HighlightedContent {
  type: "highlight";
  content: {
    style: "warning" | "info" | "note" | "coffee-break";
  };
  children: Lv2Block[];
}

export interface List {
  type: "list";
  content: {
    style: "unordered" | "ordered";
  };
  children: Lv2Block[];
}

type Lv2Block = Paragraph | Fold | HighlightedContent | List | Lv3Block;

//////////////////////////////////////////////////////////////////////
// Lv.1
export interface Section {
  type: "section";
  "content": {
    id: string;
    title: string;
  };
  children: Lv1Block[];
}

type Lv1Block = Lv2Block | Section;

//////////////////////////////////////////////////////////////////////
// Lv.0
export interface ArticleContent {
  type: "article";
  content: {
    meta: MetaContent;
    toc: TocItem[];
    ref: RefItem[];
  };
  children: Section[];
}

export interface MetaContent {
  title: string;
  author: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  summary: string;
}

export interface TocItem {
  id: string;
  title: string;
}

export interface RefItem {
  id: string;
  title: string;
  src?: string;
  author: string;
  refered_at?: string;
  caption: string;
}
