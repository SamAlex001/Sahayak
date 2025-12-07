import React, { useState } from "react";
import SearchBar from "../components/resources/SearchBar";
import CategoryFilter from "../components/resources/CategoryFilter";
import ResourceCard from "../components/resources/ResourceCard";
import { Resource } from "../types";

const ResourceHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resources: Resource[] = [
    {
      id: "1",
      title: "Understanding Cancer Treatment Options",
      description:
        "A comprehensive guide to different cancer treatment options and their effects by the National Cancer Institute.",
      category: "Treatment",
      type: "article",
      url: "https://www.cancer.gov/about-cancer/treatment/types",
    },
    {
      id: "2",
      title: "Nutrition During Cancer Treatment",
      description:
        "Expert guidance on maintaining proper nutrition during cancer treatment from the American Cancer Society.",
      category: "Wellness",
      type: "guide",
      url: "https://www.cancer.org/treatment/survivorship-during-and-after-treatment/staying-active/nutrition.html",
    },
    {
      id: "3",
      title: "Caregiver Support Resources",
      description:
        "Access valuable resources and support services for caregivers from the Family Caregiver Alliance.",
      category: "Support",
      type: "guide",
      url: "https://www.caregiver.org/caregiver-resources",
    },
    {
      id: "4",
      title: "Managing Cancer-Related Pain",
      description:
        "Learn about effective pain management strategies from medical experts at Mayo Clinic.",
      category: "Treatment",
      type: "article",
      url: "https://www.mayoclinic.org/diseases-conditions/cancer/in-depth/cancer-pain/art-20045118",
    },
    {
      id: "5",
      title: "Coping with Caregiver Stress",
      description:
        "Practical tips and strategies for managing caregiver stress and burnout from the Alzheimer's Association.",
      category: "Wellness",
      type: "guide",
      url: "https://www.alz.org/help-support/caregiving/caregiver-health/caregiver-stress",
    },
    {
      id: "6",
      title: "Financial Resources for Cancer Care",
      description:
        "Information about financial assistance programs and resources from the American Cancer Society.",
      category: "Support",
      type: "guide",
      url: "https://www.cancer.org/support-programs-and-services/financial-assistance.html",
    },
    {
      id: "7",
      title: "Elderly Care at Home - Complete Guide in Hindi",
      description:
        "बुजुर्गों की देखभाल - Complete elderly care guide including daily routines and medication management in Hindi.",
      category: "Treatment",
      type: "video",
      url: "https://www.youtube.com/watch?v=1RKVajOLdLM",
    },
    {
      id: "8",
      title: "Home Nursing Care - Patient Care Tips",
      description:
        "गृह नर्सिंग देखभाल - Essential home nursing skills for caregivers including patient handling and basic medical care.",
      category: "Treatment",
      type: "video",
      url: "https://www.youtube.com/watch?v=HLGzMgQrlWs",
    },
    {
      id: "9",
      title: "CPR Training - First Aid by Indian Red Cross",
      description:
        "CPR प्रशिक्षण - Life-saving CPR and first aid techniques by Indian healthcare professionals.",
      category: "Support",
      type: "video",
      url: "https://www.youtube.com/watch?v=hTS6gtaTHcI",
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Hub
          </h1>
          <p className="text-gray-600 mb-8">
            Access trusted information and resources to support your caregiving
            journey.
          </p>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;
