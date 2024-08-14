import React from "react";
import Header from "@/components/Header";
import Filters from "@/components/Filters";
import { getResources, getResourcesPlaylist } from "@/sanity/actions";
import ImageCard from "./ui/ImageCard";
import SearchForm from "./SearchForm";

interface Props {
  searchParams: { [key: string]: string | undefined };
}

const Work = async ({ searchParams }: Props) => {
  const resources = await getResources({
    query: searchParams?.query || "",
    category: searchParams?.category || "",
    page: "1",
  });
  const resourcesPlaylist = await getResourcesPlaylist();
  const isFilterActive = searchParams?.query || searchParams?.category;

  return (
    <div id="Work" className="pb-6 pt-28 sm:pb-12 min-h-screen">
      <div className="bg-bff_light_green" />
      <div className="w-full px-5 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 max-w-2xl">
          <div className="w-full sm:w-2/5">
            <SearchForm />
          </div>
          <div className="w-full sm:w-3/5">
            <Filters />
          </div>
        </div>
      </div>
      {isFilterActive ? (
        <section className="flex flex-col mt-6 w-full sm:mt-10 px-5 sm:px-6 lg:px-8">
          <Header
            query={searchParams?.query || ""}
            category={searchParams?.category || ""}
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-3 xl:gap-4">
            {resources?.length > 0 ? (
              resources.map((resource: any) => (
                <ImageCard
                  key={resource._id}
                  src={resource.image}
                  title={resource.title}
                />
              ))
            ) : (
              <p className="body-regular text-white-400">No resources found</p>
            )}
          </div>
        </section>
      ) : (
        resourcesPlaylist.map((item: any) => (
          <section
            key={item._id}
            className="flex flex-col mt-6 w-full sm:mt-10 px-5 sm:px-6 lg:px-8"
          >
            <h1 className="heading3 text-white-800">{item.title}</h1>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-3 xl:gap-4">
              {item.resources.map((resource: any) => (
                <ImageCard
                  key={resource._id}
                  src={resource.image}
                  title={resource.title}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default Work;
