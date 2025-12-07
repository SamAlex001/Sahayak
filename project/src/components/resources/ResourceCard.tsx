import React from "react";
import { ExternalLink, Play } from "lucide-react";
import { Resource } from "../../types";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const isVideo = resource.type === "video";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-100 rounded-full">
            {resource.category}
          </span>
          {isVideo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              <Play className="h-3 w-3" />
              Video
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
        <p className="text-gray-600 mb-4">{resource.description}</p>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-rose-600 hover:text-rose-700"
        >
          {isVideo ? "Watch video" : "Read more"}
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
