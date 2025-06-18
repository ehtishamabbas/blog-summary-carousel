import React, { useMemo } from 'react';

interface RelatedPost {
  title: string;
  url: string;
}

interface TopStoriesDisplayProps {
  related_posts?: RelatedPost[] | null;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const TopStoriesDisplay: React.FC<TopStoriesDisplayProps> = ({ related_posts }) => {
  const postsToDisplay = useMemo(() => {
    const related = related_posts || [];
    if (related.length === 0) {
      return [];
    }
    if (related.length < 3) {
      return related;
    }
    if (related.length === 3) {
      return shuffleArray(related);
    }
    return shuffleArray(related).slice(0, 3);
  }, [related_posts]);

  return (
    <div className="border border-gray-200 rounded p-4 h-full flex flex-col bg-white">
      <h3 className="text-md font-semibold mb-2 text-black">Top Stories</h3>
      {postsToDisplay.length > 0 ? (
        <ul className="list-none space-y-1 flex-grow">
          {postsToDisplay.map((post, index) => (
            <li key={index}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No top stories available at the moment.</p>
      )}
    </div>
  );
};

export default TopStoriesDisplay;
