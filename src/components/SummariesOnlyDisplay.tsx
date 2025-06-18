import React from 'react';

interface SummariesOnlyDisplayProps {
  summary1?: string | null;
  summary2?: string | null;
  summary3?: string | null;
}

const SummariesOnlyDisplay: React.FC<SummariesOnlyDisplayProps> = ({
  summary1,
  summary2,
  summary3,
}) => {
  const summaries = [summary1, summary2, summary3].filter(Boolean) as string[];

  return (
    <div className="border border-gray-200 rounded p-4 h-full flex flex-col bg-white overflow-y-auto">
      {summaries.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-sm text-black">
          {summaries.map((summary, index) => (
            <li key={index}>{summary}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No summaries available.</p>
      )}
    </div>
  );
};

export default SummariesOnlyDisplay;
