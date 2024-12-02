import React from "react";

type Reference = {
  id: string;
  title: string;
  src?: string;
  author?: string;
  refered_at?: string;
  caption?: string;
};
type ReferencesSectionProps = {
  refBlock: Reference[];
};

const ReferencesSection: React.FC<ReferencesSectionProps> = ({ refBlock }) => {
  if (!refBlock || refBlock.length === 0) {
    return null;
  }

  return (
    <section className="references">
      <h2 className="text-xl font-bold mt-8 mb-4">参考文献</h2>
      <ul className="flex flex-col gap-2">
        {refBlock.map((ref) => (
          <li key={ref.id} className="">
            <h3 className="text-lg font-semibold">
              <a
                href={ref.src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {ref.title}
              </a>
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">著者:</span> {ref.author}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">参照日:</span> {ref.refered_at}
            </p>
            {ref.caption && <p className="text-sm text-gray-500">{ref.caption}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReferencesSection;
