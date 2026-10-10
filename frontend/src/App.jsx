import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  History,
  LayoutDashboard,
  Link2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  getPages,
  createPage,
  deletePage,
  checkPage,
  getPage,
  getChangesToday,
  getAllChanges,
} from "./api";


function App() {
  const [pages, setPages] = useState([]);
  const [changes, setChanges] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [changesLoading, setChangesLoading] =
    useState(false);

  const [changesToday, setChangesToday] =
    useState(0);

  const [activeView, setActiveView] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedPage, setSelectedPage] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [checkingId, setCheckingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  const loadDashboard = async () => {
    try {
      const [
        pagesData,
        changesData,
      ] = await Promise.all([
        getPages(),
        getChangesToday(),
      ]);

      setPages(pagesData);

      setChangesToday(
        changesData?.changesToday || 0
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     LOAD CHANGES
  ========================================================= */

  const loadChanges = async () => {
    try {
      setChangesLoading(true);

      const data =
        await getAllChanges();

      setChanges(data);
    } catch (error) {
      console.error(
        "Changes loading error:",
        error
      );
    } finally {
      setChangesLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);


  /* =========================================================
     LOAD CHANGES WHEN OPENED
  ========================================================= */

  useEffect(() => {
    if (
      activeView === "changes" ||
      activeView === "history"
    ) {
      loadChanges();
    }
  }, [activeView]);


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };


  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadDashboard();

      if (
        activeView === "changes" ||
        activeView === "history"
      ) {
        await loadChanges();
      }
    } finally {
      setRefreshing(false);
    }
  };


  /* =========================================================
     ADD WEBSITE
  ========================================================= */

  const handleAddWebsite = async (
    name,
    url
  ) => {
    await createPage(name, url);

    await loadDashboard();
  };


  /* =========================================================
     CHECK WEBSITE
  ========================================================= */

  const handleCheck = async (id) => {
    try {
      setCheckingId(id);

      const result =
        await checkPage(id);

      if (result?.firstCheck) {
        alert(
          "✓ Baseline snapshot created. Future changes will be detected automatically."
        );
      } else if (result?.changed) {
        alert(
          "🚨 Change detected on this website!"
        );
      } else {
        alert(
          "✓ No changes detected."
        );
      }

      await loadDashboard();

      if (
        activeView === "changes" ||
        activeView === "history"
      ) {
        await loadChanges();
      }

      if (
        selectedPage?.id === id
      ) {
        const updated =
          await getPage(id);

        setSelectedPage(updated);
      }
    } catch (error) {
      alert(
        error?.message ||
          "Unable to check website."
      );
    } finally {
      setCheckingId(null);
    }
  };


  /* =========================================================
     OPEN PAGE DETAILS
  ========================================================= */

  const handleOpenPage = async (page) => {
    try {
      const data =
        await getPage(page.id);

      setSelectedPage(data);
    } catch (error) {
      alert(
        error?.message ||
          "Unable to load details."
      );
    }
  };


  /* =========================================================
     DELETE PAGE
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this tracked page?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deletePage(id);

      if (
        selectedPage?.id === id
      ) {
        setSelectedPage(null);
      }

      await loadDashboard();

      if (
        activeView === "changes" ||
        activeView === "history"
      ) {
        await loadChanges();
      }
    } catch (error) {
      alert(
        error?.message ||
          "Unable to delete page."
      );
    } finally {
      setDeletingId(null);
    }
  };


  /* =========================================================
     STATS
  ========================================================= */

  const totalChanges =
    useMemo(() => {
      return pages.reduce(
        (total, page) =>
          total +
          (page._count?.changes || 0),
        0
      );
    }, [pages]);


  const monitoredPages =
    pages.filter(
      (page) =>
        page.lastCheckedAt
    ).length;


  const filteredPages =
    pages.filter((page) => {
      const query =
        search
          .toLowerCase()
          .trim();

      if (!query) return true;

      return (
        page.name
          .toLowerCase()
          .includes(query) ||
        page.url
          .toLowerCase()
          .includes(query)
      );
    });


  const latestCheck =
    [...pages]
      .filter(
        (page) =>
          page.lastCheckedAt
      )
      .sort(
        (a, b) =>
          new Date(
            b.lastCheckedAt
          ) -
          new Date(
            a.lastCheckedAt
          )
      )[0];


  return (
    <div className="min-h-screen bg-[#f5faff]">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-sky-100 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        {/* BRAND */}

        <div className="flex h-[78px] items-center justify-between border-b border-slate-100 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-100">
              <Zap
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-[15px] font-bold text-slate-900">
                ChangeWatch
              </h1>

              <p className="text-[10px] font-medium text-slate-400">
                WEBSITE MONITOR
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>

        </div>


        {/* NAV */}

        <div className="flex-1 px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">

            <SidebarItem
              icon={
                <LayoutDashboard
                  size={18}
                />
              }
              label="Dashboard"
              active={
                activeView ===
                "dashboard"
              }
              onClick={() =>
                navigate(
                  "dashboard"
                )
              }
            />

            <SidebarItem
              icon={
                <Globe2 size={18} />
              }
              label="Tracked Pages"
              badge={
                pages.length
              }
              active={
                activeView ===
                "pages"
              }
              onClick={() =>
                navigate("pages")
              }
            />

            <SidebarItem
              icon={
                <Bell size={18} />
              }
              label="Changes"
              badge={
                changesToday
              }
              active={
                activeView ===
                "changes"
              }
              onClick={() =>
                navigate(
                  "changes"
                )
              }
            />

            <SidebarItem
              icon={
                <History size={18} />
              }
              label="History"
              active={
                activeView ===
                "history"
              }
              onClick={() =>
                navigate(
                  "history"
                )
              }
            />

          </nav>


          <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Preferences
          </p>

          <nav>

            <SidebarItem
              icon={
                <Settings size={18} />
              }
              label="Settings"
              onClick={() =>
                alert(
                  "Settings will be available in the next version."
                )
              }
            />

          </nav>

        </div>


        {/* STATUS */}

        <div className="p-4">

          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-xl shadow-sky-100">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Activity size={17} />
            </div>

            <p className="mt-4 text-sm font-bold">
              Monitoring active
            </p>

            <p className="mt-1 text-[11px] leading-5 text-sky-100">
              Websites are automatically checked every 5 minutes.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-sky-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />

              All systems operational
            </div>

          </div>


          <div className="mt-4 flex items-center gap-3 px-2 py-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
              BD
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                Dashboard User
              </p>

              <p className="text-[10px] text-slate-400">
                Personal workspace
              </p>
            </div>

            <ChevronDown
              size={14}
              className="ml-auto text-slate-400"
            />

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:pl-[270px]">

        {/* TOPBAR */}

        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">

          <div className="flex h-[78px] items-center justify-between px-5 sm:px-8">

            <div className="flex items-center gap-4">

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm lg:hidden"
              >
                <Menu size={19} />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-500">
                  ChangeWatch
                </p>

                <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                  {getViewTitle(
                    activeView
                  )}
                </h2>
              </div>

            </div>


            <div className="flex items-center gap-3">

              <div className="relative hidden sm:block">

                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder={
                    activeView ===
                    "changes"
                      ? "Search changes..."
                      : "Search pages..."
                  }
                  className="h-10 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                />

              </div>


              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50">
                <Bell size={17} />

                {changesToday >
                  0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-500 ring-2 ring-white" />
                )}

              </button>


              <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm sm:flex">

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                  BD
                </div>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />

              </button>

            </div>

          </div>

        </header>


        {/* ===================================================
            CONTENT SWITCH
        =================================================== */}

        {activeView ===
          "dashboard" && (
          <DashboardView
            pages={pages}
            loading={loading}
            refreshing={refreshing}
            changesToday={
              changesToday
            }
            monitoredPages={
              monitoredPages
            }
            latestCheck={
              latestCheck
            }
            filteredPages={
              filteredPages
            }
            checkingId={
              checkingId
            }
            deletingId={
              deletingId
            }
            onRefresh={
              handleRefresh
            }
            onAdd={() =>
              setModalOpen(true)
            }
            onCheck={
              handleCheck
            }
            onDelete={
              handleDelete
            }
            onOpen={
              handleOpenPage
            }
          />
        )}


        {activeView ===
          "pages" && (
          <TrackedPagesView
            pages={filteredPages}
            loading={loading}
            checkingId={
              checkingId
            }
            deletingId={
              deletingId
            }
            onAdd={() =>
              setModalOpen(true)
            }
            onCheck={
              handleCheck
            }
            onDelete={
              handleDelete
            }
            onOpen={
              handleOpenPage
            }
          />
        )}


        {activeView ===
          "changes" && (
          <ChangesView
            changes={
              changes.filter(
                (change) => {
                  const query =
                    search
                      .toLowerCase()
                      .trim();

                  if (!query)
                    return true;

                  return (
                    change.page
                      ?.name
                      ?.toLowerCase()
                      .includes(
                        query
                      ) ||
                    change.page
                      ?.url
                      ?.toLowerCase()
                      .includes(
                        query
                      ) ||
                    change.diff
                      ?.toLowerCase()
                      .includes(
                        query
                      )
                  );
                }
              )
            }
            loading={
              changesLoading
            }
            onOpen={
              async (change) => {
                await handleOpenPage(
                  change.page
                );
              }
            }
            onRefresh={
              loadChanges
            }
          />
        )}


        {activeView ===
          "history" && (
          <HistoryView
            pages={pages}
            loading={loading}
            onOpen={
              handleOpenPage
            }
          />
        )}

      </div>


      {/* MODALS */}

      <AddWebsiteModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onAdd={
          handleAddWebsite
        }
      />

      <PageDetailsModal
        page={selectedPage}
        onClose={() =>
          setSelectedPage(null)
        }
      />

    </div>
  );
}


/* =========================================================
   VIEW TITLE
========================================================= */

function getViewTitle(view) {
  const titles = {
    dashboard: "Dashboard",
    pages: "Tracked Pages",
    changes: "Changes",
    history: "History",
  };

  return titles[view] || "Dashboard";
}


/* =========================================================
   DASHBOARD VIEW
========================================================= */

function DashboardView({
  pages,
  loading,
  refreshing,
  changesToday,
  monitoredPages,
  latestCheck,
  filteredPages,
  checkingId,
  deletingId,
  onRefresh,
  onAdd,
  onCheck,
  onDelete,
  onOpen,
}) {
  return (
    <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-sky-500 via-sky-500 to-blue-600 px-6 py-8 text-white shadow-xl shadow-sky-100 sm:px-9 sm:py-9">

        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-40 right-40 h-80 w-80 rounded-full bg-white/5" />

        <div className="absolute right-10 top-10 opacity-10">
          <Globe2 size={130} />
        </div>

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

              Monitoring active

            </div>

            <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-[30px]">
              Keep an eye on what matters.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100">
              Track webpages automatically and know exactly when their content changes.
            </p>

          </div>

          <button
            onClick={onAdd}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-700 shadow-lg transition hover:bg-sky-50"
          >
            <Plus size={17} />
            Add Website
          </button>

        </div>

      </section>


      {/* STATS */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Tracked Pages"
          value={pages.length}
          subtitle="websites monitored"
          icon={
            <Globe2 size={20} />
          }
          iconBackground="bg-sky-50"
          iconColor="text-sky-500"
        />

        <StatCard
          title="Changes Today"
          value={changesToday}
          subtitle="detected today"
          icon={
            <AlertCircle size={20} />
          }
          iconBackground="bg-amber-50"
          iconColor="text-amber-500"
        />

        <StatCard
          title="Active Monitoring"
          value={monitoredPages}
          subtitle="pages checked"
          icon={
            <CheckCircle2 size={20} />
          }
          iconBackground="bg-emerald-50"
          iconColor="text-emerald-500"
        />

        <StatCard
          title="Check Interval"
          value="5 min"
          subtitle="automatic checks"
          icon={
            <Clock3 size={20} />
          }
          iconBackground="bg-blue-50"
          iconColor="text-blue-500"
        />

      </section>


      {/* PAGES */}

      <section className="mt-8">

        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your tracked pages
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Websites you're currently monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">

            {latestCheck && (
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-400 md:flex">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                Last checked{" "}
                {new Date(
                  latestCheck.lastCheckedAt
                ).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}

              </div>
            )}

            <button
              onClick={onRefresh}
              disabled={
                refreshing
              }
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

          </div>

        </div>


        {loading ? (
          <LoadingCards />
        ) : filteredPages.length ===
          0 ? (
          <EmptyState
            onAdd={onAdd}
            search=""
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">

            {filteredPages.map(
              (page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  checking={
                    checkingId ===
                    page.id
                  }
                  deleting={
                    deletingId ===
                    page.id
                  }
                  onCheck={
                    onCheck
                  }
                  onDelete={
                    onDelete
                  }
                  onOpen={
                    onOpen
                  }
                />
              )
            )}

          </div>
        )}

      </section>

    </main>
  );
}


/* =========================================================
   TRACKED PAGES VIEW
========================================================= */

function TrackedPagesView({
  pages,
  loading,
  checkingId,
  deletingId,
  onAdd,
  onCheck,
  onDelete,
  onOpen,
}) {
  return (
    <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

      <PageHeader
        title="Tracked Pages"
        description="Manage all webpages currently being monitored."
        buttonText="Add Website"
        onButton={onAdd}
      />

      {loading ? (
        <LoadingCards />
      ) : pages.length === 0 ? (
        <EmptyState
          onAdd={onAdd}
          search=""
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">

          {pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              checking={
                checkingId ===
                page.id
              }
              deleting={
                deletingId ===
                page.id
              }
              onCheck={onCheck}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}

        </div>
      )}

    </main>
  );
}


/* =========================================================
   CHANGES VIEW
========================================================= */

function ChangesView({
  changes,
  loading,
  onOpen,
  onRefresh,
}) {
  return (
    <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

      <PageHeader
        title="Changes"
        description="Every detected website change in one place."
        buttonText="Refresh"
        onButton={onRefresh}
        refresh
      />

      {loading ? (
        <LoadingChangeCards />
      ) : changes.length === 0 ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-gradient-to-b from-sky-50/70 to-white text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-md shadow-sky-100">
            <CheckCircle2 size={28} />
          </div>

          <h3 className="mt-5 text-base font-bold text-slate-900">
            No changes detected
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Everything is currently stable. When a tracked website changes, it will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {changes.map(
            (change) => (
              <ChangeCard
                key={change.id}
                change={change}
                onOpen={onOpen}
              />
            )
          )}

        </div>
      )}

    </main>
  );
}


/* =========================================================
   HISTORY VIEW
========================================================= */

function HistoryView({
  pages,
  loading,
  onOpen,
}) {
  return (
    <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

      <PageHeader
        title="History"
        description="Browse tracked page snapshots and monitoring activity."
      />

      {loading ? (
        <LoadingHistory />
      ) : (
        <div className="space-y-6">

          {pages.map((page) => (
            <HistoryCard
              key={page.id}
              page={page}
              onOpen={onOpen}
            />
          ))}

          {pages.length === 0 && (
            <EmptyState
              search=""
              onAdd={() => {}}
            />
          )}

        </div>
      )}

    </main>
  );
}


/* =========================================================
   HISTORY CARD
========================================================= */

function HistoryCard({
  page,
  onOpen,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <Globe2 size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {page.name}
            </h3>

            <p className="mt-1 truncate text-[11px] text-slate-400">
              {page.url}
            </p>
          </div>

        </div>

        <button
          onClick={() =>
            onOpen(page)
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-600 hover:bg-sky-100"
        >
          <FileText size={14} />
          View History
        </button>

      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <HistoryStat
          label="Snapshots"
          value={
            page._count?.snapshots ||
            page.snapshots?.length ||
            0
          }
        />

        <HistoryStat
          label="Changes"
          value={
            page._count?.changes ||
            page.changes?.length ||
            0
          }
        />

        <HistoryStat
          label="Last checked"
          value={
            page.lastCheckedAt
              ? new Date(
                  page.lastCheckedAt
                ).toLocaleString()
              : "Never"
          }
        />

      </div>

    </div>
  );
}


/* =========================================================
   CHANGE CARD
========================================================= */

function ChangeCard({
  change,
  onOpen,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex min-w-0 gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <AlertCircle
              size={20}
            />
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-sm font-bold text-slate-900">
                {change.page?.name ||
                  "Unknown page"}
              </h3>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-600">
                CHANGE DETECTED
              </span>

            </div>

            <p className="mt-1 truncate text-[11px] text-slate-400">
              {change.page?.url}
            </p>

            <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-400">

              <Clock3 size={12} />

              {new Date(
                change.createdAt
              ).toLocaleString()}

            </div>

          </div>

        </div>


        <button
          onClick={() =>
            onOpen(change)
          }
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600"
        >
          <FileText size={14} />
          View Details
        </button>

      </div>


      <div className="mt-5 grid gap-3 md:grid-cols-2">

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-400" />

            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
              Previous
            </p>

          </div>

          <p className="mt-2 max-h-16 overflow-hidden text-xs leading-5 text-red-900">
            {change.previousContent}
          </p>

        </div>


        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Current
            </p>

          </div>

          <p className="mt-2 max-h-16 overflow-hidden text-xs leading-5 text-emerald-900">
            {change.currentContent}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({
  title,
  description,
  buttonText,
  onButton,
  refresh = false,
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      {buttonText && (
        <button
          onClick={onButton}
          className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600"
        >
          {refresh ? (
            <RefreshCw size={14} />
          ) : (
            <Plus size={14} />
          )}

          {buttonText}
        </button>
      )}

    </div>
  );
}


/* =========================================================
   HISTORY STAT
========================================================= */

function HistoryStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingCards() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        )
      )}
    </div>
  );
}


function LoadingChangeCards() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        )
      )}
    </div>
  );
}


function LoadingHistory() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        )
      )}
    </div>
  );
}


/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition ${
        active
          ? "bg-sky-50 text-sky-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="flex items-center gap-3">

        <span
          className={
            active
              ? "text-sky-500"
              : "text-slate-400 group-hover:text-slate-600"
          }
        >
          {icon}
        </span>

        {label}

      </span>

      {badge !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            active
              ? "bg-white text-sky-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {badge}
        </span>
      )}

    </button>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          {icon}
        </div>

        <div className="h-2 w-2 rounded-full bg-emerald-400" />

      </div>

      <p className="mt-5 text-xs font-semibold text-slate-500">
        {title}
      </p>

      <div className="mt-1 flex items-end justify-between gap-2">

        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="pb-1 text-[10px] font-medium text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   PAGE CARD
========================================================= */

function PageCard({
  page,
  checking,
  deleting,
  onCheck,
  onDelete,
  onOpen,
}) {
  const hasChanges =
    (page._count?.changes || 0) >
    0;

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50">

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-sky-500">
            <Globe2 size={20} />
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-sm font-bold text-slate-900">
              {page.name}
            </h3>

            <a
              href={page.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex max-w-full items-center gap-1 truncate text-[11px] text-slate-400 hover:text-sky-500"
            >
              <span className="truncate">
                {page.url}
              </span>

              <ExternalLink
                size={11}
                className="shrink-0"
              />
            </a>

          </div>

        </div>


        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            hasChanges
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {hasChanges ? (
            <AlertCircle
              size={12}
            />
          ) : (
            <CheckCircle2
              size={12}
            />
          )}

          {hasChanges
            ? "Changes found"
            : "Monitoring"}
        </div>

      </div>


      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-slate-50 p-3.5">

          <p className="text-[10px] font-medium text-slate-400">
            Changes detected
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {page._count?.changes || 0}
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-3.5">

          <p className="text-[10px] font-medium text-slate-400">
            Last checked
          </p>

          <div className="mt-1 flex items-center gap-1.5">

            <Clock3
              size={12}
              className="text-sky-400"
            />

            <p className="truncate text-[11px] font-semibold text-slate-700">
              {page.lastCheckedAt
                ? new Date(
                    page.lastCheckedAt
                  ).toLocaleString()
                : "Never"}
            </p>

          </div>

        </div>

      </div>


      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">

        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          Every 5 minutes

        </span>


        <div className="flex flex-wrap gap-2">

          <button
            onClick={() =>
              onOpen(page)
            }
            disabled={
              checking ||
              deleting
            }
            className="flex h-8 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 text-[11px] font-semibold text-sky-600 hover:bg-sky-100 disabled:opacity-50"
          >
            <FileText size={13} />
            Details
          </button>


          <button
            onClick={() =>
              onCheck(page.id)
            }
            disabled={
              checking ||
              deleting
            }
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                checking
                  ? "animate-spin"
                  : ""
              }
            />

            {checking
              ? "Checking..."
              : "Check"}
          </button>


          <button
            onClick={() =>
              onDelete(page.id)
            }
            disabled={
              checking ||
              deleting
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <RefreshCw
                size={14}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={14}
              />
            )}
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  onAdd,
  search,
}) {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-gradient-to-b from-sky-50/70 to-white px-6 py-14 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-md shadow-sky-100">

        {search ? (
          <Search size={27} />
        ) : (
          <Globe2 size={28} />
        )}

      </div>


      <h3 className="mt-5 text-base font-bold text-slate-900">
        {search
          ? "No matching pages"
          : "Start monitoring your first page"}
      </h3>


      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Try searching with a different website name or URL."
          : "Add a webpage and we'll automatically monitor it for content changes."}
      </p>


      {!search && (
        <button
          onClick={onAdd}
          className="mt-6 flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600"
        >
          <Plus size={17} />
          Add your first page
        </button>
      )}

    </div>
  );
}


/* =========================================================
   ADD WEBSITE MODAL
========================================================= */

function AddWebsiteModal({
  open,
  onClose,
  onAdd,
}) {
  const [name, setName] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  if (!open) return null;


  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !name.trim() ||
        !url.trim()
      ) {
        alert(
          "Please enter both a website name and URL."
        );

        return;
      }

      try {
        setLoading(true);

        await onAdd(
          name.trim(),
          url.trim()
        );

        setName("");
        setUrl("");

        onClose();
      } catch (error) {
        alert(
          error?.message ||
            "Unable to add website."
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-2xl">

        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 px-6 py-7 text-white">

          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl bg-white/10 p-2 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Globe2 size={21} />
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Track a new website
            </h2>

            <p className="mt-1 text-sm text-sky-100">
              Add a webpage and let ChangeWatch monitor it automatically.
            </p>
          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <div>

            <label className="mb-2 block text-xs font-bold text-slate-700">
              Website name
            </label>

            <div className="relative">

              <Globe2
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="e.g. Company Careers"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
              />

            </div>

          </div>


          <div>

            <label className="mb-2 block text-xs font-bold text-slate-700">
              Page URL
            </label>

            <div className="relative">

              <Link2
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="url"
                value={url}
                onChange={(e) =>
                  setUrl(
                    e.target.value
                  )
                }
                placeholder="https://example.com/jobs"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
              />

            </div>

          </div>


          <div className="flex gap-3 rounded-xl bg-sky-50 p-4">

            <Activity
              size={16}
              className="mt-0.5 shrink-0 text-sky-500"
            />

            <div>

              <p className="text-xs font-bold text-sky-800">
                Automatic monitoring
              </p>

              <p className="mt-1 text-[11px] leading-5 text-sky-600">
                The page will be checked every 5 minutes. Changes are stored in your history.
              </p>

            </div>

          </div>


          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {loading
                ? "Adding..."
                : "Start monitoring"}

              {!loading && (
                <Check size={16} />
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   PAGE DETAILS MODAL
========================================================= */

function PageDetailsModal({
  page,
  onClose,
}) {
  if (!page) return null;

  const changes =
    page.changes || [];

  const latestChange =
    changes[0];


  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

        {/* HEADER */}

        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                <Globe2 size={22} />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {page.name}
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                    MONITORED
                  </span>

                </div>

                <a
                  href={page.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-sky-500"
                >
                  <span className="truncate">
                    {page.url}
                  </span>

                  <ExternalLink size={12} />
                </a>

              </div>

            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700"
            >
              <X size={19} />
            </button>

          </div>

        </div>


        {/* CONTENT */}

        <div className="overflow-y-auto p-6">

          <div className="grid gap-4 md:grid-cols-3">

            <DetailStat
              icon={
                <History size={18} />
              }
              label="Total changes"
              value={
                changes.length
              }
              background="bg-amber-50"
              color="text-amber-500"
            />

            <DetailStat
              icon={
                <Clock3 size={18} />
              }
              label="Last checked"
              value={
                page.lastCheckedAt
                  ? new Date(
                      page.lastCheckedAt
                    ).toLocaleString()
                  : "Never"
              }
              background="bg-sky-50"
              color="text-sky-500"
            />

            <DetailStat
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Monitoring"
              value="Every 5 min"
              background="bg-emerald-50"
              color="text-emerald-500"
            />

          </div>


          {/* LATEST CHANGE */}

          <div className="mt-7">

            <div className="mb-4 flex justify-between gap-3">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Latest change
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  The most recent difference detected.
                </p>
              </div>

              {latestChange && (
                <span className="flex h-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600">
                  <AlertCircle size={12} />
                  Change detected
                </span>
              )}

            </div>


            {!latestChange ? (

              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-12 text-center">

                <CheckCircle2
                  size={26}
                  className="mx-auto text-emerald-500"
                />

                <h4 className="mt-4 text-sm font-bold text-slate-800">
                  No changes detected yet
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  This page is being monitored.
                </p>

              </div>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-slate-200">

                <div className="grid md:grid-cols-2">

                  <div className="border-b border-slate-200 bg-red-50/60 p-5 md:border-b-0 md:border-r">

                    <p className="text-xs font-bold text-red-700">
                      Previous version
                    </p>

                    <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-red-100 bg-white p-4 text-xs leading-6 text-slate-600">
                      {
                        latestChange.previousContent
                      }
                    </div>

                  </div>


                  <div className="bg-emerald-50/60 p-5">

                    <p className="text-xs font-bold text-emerald-700">
                      Current version
                    </p>

                    <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-emerald-100 bg-white p-4 text-xs leading-6 text-slate-600">
                      {
                        latestChange.currentContent
                      }
                    </div>

                  </div>

                </div>


                <div className="border-t border-slate-200 bg-slate-50 p-5">

                  <div className="flex items-center gap-2">

                    <ArrowLeftRight
                      size={15}
                      className="text-sky-500"
                    />

                    <p className="text-xs font-bold text-slate-800">
                      Detected difference
                    </p>

                  </div>

                  <VisualDiff
                    diff={
                      latestChange.diff
                    }
                  />

                </div>

              </div>
            )}

          </div>


          {/* HISTORY */}

          <div className="mt-8">

            <h3 className="text-sm font-bold text-slate-900">
              Change history
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Timeline of detected changes.
            </p>


            <div className="mt-4 space-y-3">

              {changes.length ===
              0 ? (

                <div className="rounded-xl bg-slate-50 p-8 text-center">

                  <CalendarDays
                    size={22}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No history available
                  </p>

                </div>

              ) : (

                changes.map(
                  (change) => (
                    <div
                      key={
                        change.id
                      }
                      className="rounded-2xl border border-slate-100 bg-white p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-2">

                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                            <AlertCircle
                              size={14}
                            />
                          </span>

                          <span className="text-xs font-bold text-slate-800">
                            Content changed
                          </span>

                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(
                            change.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                      <p className="mt-3 max-h-16 overflow-hidden text-[11px] leading-5 text-slate-500">
                        {change.diff}
                      </p>

                    </div>
                  )
                )

              )}

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">

          <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Monitoring every 5 minutes

          </span>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   VISUAL DIFF
========================================================= */

function VisualDiff({ diff }) {
  if (!diff) {
    return (
      <div className="mt-3 rounded-xl bg-white p-4 text-xs text-slate-400">
        No difference information available.
      </div>
    );
  }

  const parts = diff.split(
    /(\[ADDED\]|\[REMOVED\])/g
  );

  const rows = [];

  let currentType =
    "normal";


  for (const part of parts) {

    if (!part.trim()) {
      continue;
    }

    if (part === "[ADDED]") {
      currentType = "added";
      continue;
    }

    if (part === "[REMOVED]") {
      currentType =
        "removed";
      continue;
    }

    rows.push({
      type: currentType,
      text: part.trim(),
    });

    currentType =
      "normal";
  }


  return (
    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">

      {rows.length === 0 ? (

        <div className="rounded-xl bg-white p-4 text-xs text-slate-400">
          No visible differences found.
        </div>

      ) : (

        rows.map(
          (row, index) => {

            if (
              row.type ===
              "added"
            ) {
              return (
                <div
                  key={index}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                >

                  <div className="mb-2 flex items-center gap-2">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                      +
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Added
                    </span>

                  </div>

                  <p className="whitespace-pre-wrap text-xs leading-6 text-emerald-900">
                    {row.text}
                  </p>

                </div>
              );
            }


            if (
              row.type ===
              "removed"
            ) {
              return (
                <div
                  key={index}
                  className="rounded-xl border border-red-200 bg-red-50 p-4"
                >

                  <div className="mb-2 flex items-center gap-2">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                      −
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Removed
                    </span>

                  </div>

                  <p className="whitespace-pre-wrap text-xs leading-6 text-red-900">
                    {row.text}
                  </p>

                </div>
              );
            }


            return (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-white p-4"
              >

                <p className="whitespace-pre-wrap text-xs leading-6 text-slate-600">
                  {row.text}
                </p>

              </div>
            );
          }
        )

      )}

    </div>
  );
}


/* =========================================================
   DETAIL STAT
========================================================= */

function DetailStat({
  icon,
  label,
  value,
  background,
  color,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${background} ${color}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


export default App;