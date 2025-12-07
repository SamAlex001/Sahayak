import { useState, useEffect } from "react";
import { BookOpen, Play, CheckCircle } from "lucide-react";

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  completed?: boolean;
}

const Training = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  // Load completed videos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("completedTrainingVideos");
    if (saved) {
      try {
        setCompletedVideos(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading completed videos:", error);
      }
    }
  }, []);

  const baseVideos: TrainingVideo[] = [
    {
      id: "1",
      title: "Elderly Care at Home - Complete Guide in Hindi",
      description:
        "बुजुर्गों की देखभाल के लिए संपूर्ण गाइड। Learn complete elderly care including daily routines, medication management, and maintaining dignity in Hindi language.",
      duration: "8:45",
      videoUrl: "https://www.youtube.com/embed/1RKVajOLdLM",
      thumbnail: "https://img.youtube.com/vi/1RKVajOLdLM/maxresdefault.jpg",
    },
    {
      id: "2",
      title: "Home Nursing Care - Patient Care Tips",
      description:
        "गृह नर्सिंग देखभाल - Essential home nursing skills for caregivers including bed bathing, patient handling, and basic medical care at home.",
      duration: "10:15",
      videoUrl: "https://www.youtube.com/embed/HLGzMgQrlWs",
      thumbnail: "https://img.youtube.com/vi/HLGzMgQrlWs/maxresdefault.jpg",
    },
    {
      id: "3",
      title: "CPR Training - First Aid by Indian Red Cross",
      description:
        "CPR प्रशिक्षण - Learn life-saving CPR and first aid techniques demonstrated by Indian healthcare professionals for emergency situations.",
      duration: "6:30",
      videoUrl: "https://www.youtube.com/embed/hTS6gtaTHcI",
      thumbnail: "https://img.youtube.com/vi/hTS6gtaTHcI/maxresdefault.jpg",
    },
  ];

  // Add completed status to videos
  const videos = baseVideos.map((video) => ({
    ...video,
    completed: completedVideos.includes(video.id),
  }));

  const handleVideoClick = (videoId: string) => {
    setActiveVideo(videoId);
  };

  const markAsComplete = (videoId: string) => {
    if (!completedVideos.includes(videoId)) {
      const updated = [...completedVideos, videoId];
      setCompletedVideos(updated);
      localStorage.setItem("completedTrainingVideos", JSON.stringify(updated));
    }
  };

  const currentVideo = videos.find((v) => v.id === activeVideo);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <BookOpen className="h-8 w-8 text-rose-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Training Center</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-rose-50 rounded-lg p-4">
            <h3 className="font-semibold text-rose-900 mb-2">
              Available Videos
            </h3>
            <p className="text-4xl font-bold text-rose-600">{videos.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">
              {videos.filter((video) => video.completed).length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-yellow-600">
              {videos.filter((video) => !video.completed).length}
            </p>
          </div>
        </div>

        {activeVideo && currentVideo && (
          <div className="mb-8">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={`${currentVideo.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Training Video"
                frameBorder="0"
              />
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {currentVideo.title}
                    </h3>
                    {currentVideo.completed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600">{currentVideo.description}</p>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <a
                    href={currentVideo.videoUrl
                      .replace("/embed/", "/watch?v=")
                      .replace("videoseries?list=", "playlist?list=")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Play className="h-4 w-4" />
                    Watch on YouTube
                  </a>
                  {!currentVideo.completed && (
                    <button
                      onClick={() => markAsComplete(activeVideo)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-3">
                <p className="font-medium text-blue-800 mb-1">
                  💡 Can't see the video?
                </p>
                <p className="text-blue-700">
                  Some videos may have embedding restrictions. Click "Watch on
                  YouTube" above to view the content directly on YouTube's
                  website.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className="relative aspect-video bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${video.thumbnail})` }}
                onClick={() => handleVideoClick(video.id)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                  {video.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Training;
