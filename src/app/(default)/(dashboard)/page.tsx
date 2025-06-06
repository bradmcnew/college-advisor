import { getMajors, getSchools } from "~/server/queries";
import { FilterButton } from "~/app/components/FilterButton";
import { PostGrid } from "~/app/(default)/(dashboard)/PostGrid";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import {
  fetchPostsAction,
  fetchPostsByFilterAction,
} from "~/app/(default)/(dashboard)/actions";
import { requireAuth } from "~/lib/auth-utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { school?: string; major?: string; gradYear?: string };
}) {
  await requireAuth();

  const params = await searchParams;

  const schools = await getSchools();
  const majors = await getMajors();
  const gradYears: {
    value: string;
    label: string;
    id: number;
  }[] = Array.from({ length: 6 }, (_, i) => {
    const year = 2025 + i;
    return {
      id: year,
      value: year.toString(),
      label: year.toString(),
    };
  });

  const schoolId = params.school
    ? (schools.find((s) => s.label === params.school)?.id ?? null)
    : null;
  const majorId = params.major
    ? (majors.find((m) => m.label === params.major)?.id ?? null)
    : null;
  const graduationYear = params.gradYear
    ? (gradYears.find((g) => g.label === params.gradYear)?.id ?? null)
    : null;

  const initialPosts =
    schoolId || majorId || graduationYear
      ? await fetchPostsByFilterAction(schoolId, majorId, graduationYear)
      : await fetchPostsAction();

  return (
    <main className="min-h-screen pt-16 text-foreground">
      {/* Filter Popover */}
      <div className="sticky top-[80px] z-10 flex justify-start px-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="border-border/70 bg-background/60 shadow-lg backdrop-blur-md transition-colors duration-300"
            >
              <Filter className="ml-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="ml-2 w-80 border-border/40 bg-background/60 p-4 shadow-lg backdrop-blur-md"
            align="end"
          >
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">Filter Mentors</h2>
              <div className="flex flex-col gap-3">
                <FilterButton
                  filterItems={schools}
                  startValue={(await searchParams).school ?? ""}
                  queryName="school"
                  aria-label="Filter by school"
                />
                <FilterButton
                  filterItems={majors}
                  startValue={(await searchParams).major ?? ""}
                  queryName="major"
                  aria-label="Filter by major"
                />
                <FilterButton
                  filterItems={gradYears}
                  startValue={(await searchParams).gradYear ?? ""}
                  queryName="gradYear"
                  aria-label="Filter by graduation year"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Post Grid */}
      <PostGrid
        posts={initialPosts}
        schoolId={schoolId}
        majorId={majorId}
        graduationYear={graduationYear}
      />
    </main>
  );
}
