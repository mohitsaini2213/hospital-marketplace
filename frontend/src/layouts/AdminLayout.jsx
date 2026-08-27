```jsx
import { useEffect, useRef, useState } from 'react';
import hmLogo from '@/assets/hm-logo.gif';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';

import {
  FaGauge,
  FaBuilding,
  FaClipboardCheck,
  FaCalendarCheck,
  FaLayerGroup,
  FaGlobe,
  FaStar,
  FaBell,
  FaClockRotateLeft,
  FaRightFromBracket,
  FaUserShield,
  FaCheckDouble,
  FaCircle,
  FaXmark,
  FaRotate,
} from 'react-icons/fa6';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notificationService } from '@/services/adminService';

const LINKS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: FaGauge,
    end: true,
  },
  {
    to: '/admin/facilities',
    label: 'Facilities',
    icon: FaBuilding,
  },
  {
    to: '/admin/facilities?status=PENDING',
    label: 'Pending Approvals',
    icon: FaClipboardCheck,
  },
  {
    to: '/admin/appointments',
    label: 'Appointments',
    icon: FaCalendarCheck,
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    icon: FaLayerGroup,
  },
  {
    to: '/admin/website-leads',
    label: 'Website Leads',
    icon: FaGlobe,
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    icon: FaStar,
  },
  {
    to: '/admin/admins',
    label: 'Users',
    icon: FaUserShield,
  },
  {
    to: '/admin/activity',
    label: 'Activity Logs',
    icon: FaClockRotateLeft,
  },
];

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const notificationRef = useRef(null);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const res = await notificationService.list();

      const notificationList =
        res?.notifications ||
        res?.data ||
        (Array.isArray(res) ? res : []);

      setNotifications(
        Array.isArray(notificationList)
          ? notificationList
          : []
      );

      const calculatedUnread = notificationList.filter(
        (notification) =>
          !notification?.read &&
          !notification?.isRead &&
          !notification?.readAt
      ).length;

      setUnread(
        Number(
          res?.unreadCount ??
            res?.unread ??
            calculatedUnread
        ) || 0
      );
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // =========================================================
  // INITIAL NOTIFICATION LOAD
  // =========================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================================================
  // CLOSE NOTIFICATION DROPDOWN ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // NOTIFICATION BUTTON
  // =========================================================

  const handleNotificationClick = async () => {
    const willOpen = !notificationOpen;

    setNotificationOpen(willOpen);

    if (willOpen) {
      await loadNotifications();
    }
  };

  // =========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =========================================================

  const handleMarkRead = async (notification) => {
    const id =
      notification?._id ||
      notification?.id;

    if (!id) {
      console.warn(
        'Notification ID missing:',
        notification
      );
      return;
    }

    try {
      await notificationService.markRead(id);

      setNotifications((previous) =>
        previous.map((item) => {
          const itemId =
            item?._id ||
            item?.id;

          if (itemId === id) {
            return {
              ...item,
              read: true,
              isRead: true,
              readAt: new Date().toISOString(),
            };
          }

          return item;
        })
      );

      setUnread((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );

      toast.error(
        'Could not mark notification as read.'
      );
    }
  };

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const handleMarkAllRead = async () => {
    if (unread === 0) {
      return;
    }

    try {
      await notificationService.markAllRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
          readAt:
            notification?.readAt ||
            new Date().toISOString(),
        }))
      );

      setUnread(0);

      toast.success(
        'All notifications marked as read.'
      );
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );

      toast.error(
        'Could not mark notifications as read.'
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    await logout();

    toast.success(
      'Logged out successfully.'
    );

    navigate('/admin/login');
  };

  // =========================================================
  // NOTIFICATION HELPERS
  // =========================================================

  const getNotificationId = (notification) =>
    notification?._id ||
    notification?.id;

  const isNotificationRead = (notification) =>
    notification?.read === true ||
    notification?.isRead === true ||
    Boolean(notification?.readAt);

  const getNotificationTitle = (notification) =>
    notification?.title ||
    notification?.subject ||
    notification?.type ||
    'Notification';

  const getNotificationMessage = (notification) =>
    notification?.message ||
    notification?.description ||
    notification?.body ||
    'You have a new notification.';

  const formatNotificationTime = (
    notification
  ) => {
    const dateValue =
      notification?.createdAt ||
      notification?.created_at ||
      notification?.date;

    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-teal-900)] text-white lg:flex">

        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 px-6 py-5 font-display text-base font-semibold"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/10">
            <img
              src={hmLogo}
              alt="Hospital Marketplace"
              className="h-full w-full object-cover scale-[1.8]"
            />
          </span>

          <span>
            Hospital Marketplace
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {LINKS.map(
            ({
              to,
              label,
              icon: Icon,
              end,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/12 text-white'
                      : 'text-white/65 hover:bg-white/8 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon size={15} />

                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="border-t border-white/10 p-3">

          <div className="mb-2 truncate px-3 text-xs text-white/50">
            {admin?.name} · {admin?.role}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/8"
          >
            <FaRightFromBracket size={15} />

            Logout
          </button>

        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="relative flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-3 lg:px-6">

          {/* Mobile Logo */}

          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 font-display text-base font-semibold text-[var(--color-teal-900)] lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
              <img
                src={hmLogo}
                alt="Hospital Marketplace"
                className="h-full w-full object-cover scale-[1.8]"
              />
            </span>

            <span>
              Hospital Marketplace
            </span>
          </Link>

          {/* Desktop Search */}

          <div className="hidden max-w-sm flex-1 lg:block">
            <input
              placeholder="Search facilities, leads, admins…"
              className="input"
            />
          </div>

          {/* =================================================
              HEADER RIGHT SIDE
          ================================================== */}

          <div className="flex items-center gap-4">

            {/* =================================================
                NOTIFICATION AREA
            ================================================== */}

            <div
              ref={notificationRef}
              className="relative"
            >

              {/* Notification Button */}

              <button
                type="button"
                onClick={handleNotificationClick}
                aria-label="Notifications"
                aria-expanded={
                  notificationOpen
                }
                aria-haspopup="true"
                className={[
                  'relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-paper-dim)]',
                  notificationOpen
                    ? 'bg-[var(--color-paper-dim)]'
                    : '',
                ].join(' ')}
              >
                <FaBell size={17} />

                {unread > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-red-600)] px-1 text-[10px] font-bold leading-none text-white">
                    {unread > 9
                      ? '9+'
                      : unread}
                  </span>
                )}
              </button>

              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================== */}

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-[100] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-2xl">

                  {/* Dropdown Header */}

                  <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">

                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                        {unread > 0
                          ? `${unread} unread notification${
                              unread > 1
                                ? 's'
                                : ''
                            }`
                          : 'You are all caught up'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">

                      {/* Refresh */}

                      <button
                        type="button"
                        onClick={
                          loadNotifications
                        }
                        disabled={
                          notificationLoading
                        }
                        aria-label="Refresh notifications"
                        title="Refresh notifications"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)] disabled:opacity-50"
                      >
                        <FaRotate
                          size={13}
                          className={
                            notificationLoading
                              ? 'animate-spin'
                              : ''
                          }
                        />
                      </button>

                      {/* Mark All Read */}

                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={
                            handleMarkAllRead
                          }
                          aria-label="Mark all notifications as read"
                          title="Mark all as read"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-teal-700)] hover:bg-[var(--color-teal-050)]"
                        >
                          <FaCheckDouble
                            size={14}
                          />
                        </button>
                      )}

                      {/* Close */}

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationOpen(
                            false
                          )
                        }
                        aria-label="Close notifications"
                        title="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
                      >
                        <FaXmark
                          size={15}
                        />
                      </button>

                    </div>
                  </div>

                  {/* =================================================
                      NOTIFICATION LIST
                  ================================================== */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {/* Loading */}

                    {notificationLoading &&
                    notifications.length === 0 ? (
                      <div className="flex items-center justify-center px-4 py-10">

                        <FaRotate
                          size={18}
                          className="animate-spin text-[var(--color-teal-600)]"
                        />

                        <span className="ml-2 text-sm text-[var(--color-ink-soft)]">
                          Loading notifications...
                        </span>

                      </div>
                    ) : notifications.length ===
                      0 ? (

                      /* Empty */

                      <div className="px-4 py-10 text-center">

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-paper-dim)]">
                          <FaBell
                            size={18}
                            className="text-[var(--color-ink-soft)]"
                          />
                        </div>

                        <p className="text-sm font-medium text-[var(--color-ink)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                          New notifications will appear here.
                        </p>

                      </div>
                    ) : (

                      /* Notifications */

                      notifications.map(
                        (notification, index) => {
                          const id =
                            getNotificationId(
                              notification
                            );

                          const read =
                            isNotificationRead(
                              notification
                            );

                          return (
                            <div
                              key={
                                id ||
                                `notification-${index}`
                              }
                              className={[
                                'border-b border-[var(--color-line)] px-4 py-3 transition-colors last:border-b-0',
                                read
                                  ? 'bg-white'
                                  : 'bg-[var(--color-teal-050)]/50',
                              ].join(' ')}
                            >

                              <div className="flex gap-3">

                                {/* Unread Dot */}

                                <div className="pt-1">

                                  {!read ? (
                                    <FaCircle
                                      size={7}
                                      className="text-[var(--color-teal-600)]"
                                    />
                                  ) : (
                                    <div className="h-[7px] w-[7px]" />
                                  )}

                                </div>

                                {/* Notification Content */}

                                <div className="min-w-0 flex-1">

                                  <p
                                    className={[
                                      'text-sm',
                                      read
                                        ? 'font-medium text-[var(--color-ink)]'
                                        : 'font-semibold text-[var(--color-ink)]',
                                    ].join(' ')}
                                  >
                                    {getNotificationTitle(
                                      notification
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
                                    {getNotificationMessage(
                                      notification
                                    )}
                                  </p>

                                  {formatNotificationTime(
                                    notification
                                  ) && (
                                    <p className="mt-2 text-[10px] text-[var(--color-ink-soft)]">
                                      {formatNotificationTime(
                                        notification
                                      )}
                                    </p>
                                  )}

                                  {/* Mark As Read */}

                                  {!read &&
                                    id && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMarkRead(
                                            notification
                                          )
                                        }
                                        className="mt-2 text-xs font-semibold text-[var(--color-teal-700)] hover:underline"
                                      >
                                        Mark as read
                                      </button>
                                    )}

                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    )}

                  </div>

                  {/* =================================================
                      DROPDOWN FOOTER
                  ================================================== */}

                  {notifications.length >
                    0 && (
                    <div className="border-t border-[var(--color-line)] px-4 py-2.5">

                      <button
                        type="button"
                        onClick={
                          loadNotifications
                        }
                        className="w-full text-center text-xs font-medium text-[var(--color-teal-700)] hover:underline"
                      >
                        Refresh notifications
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                ADMIN AVATAR
            ================================================== */}

            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-teal-600)] text-xs font-semibold text-white"
              title={
                admin?.name ||
                'Admin'
              }
            >
              {admin?.name?.[0]?.toUpperCase() ||
                'A'}
            </div>

          </div>
        </header>

        {/* ===================================================
            MOBILE NAVIGATION
        ==================================================== */}

        <div className="border-b border-[var(--color-line)] bg-white px-4 py-2 lg:hidden">

          <div className="flex gap-1 overflow-x-auto">

            {LINKS.map(
              ({
                to,
                label,
                end,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium',
                      isActive
                        ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]'
                        : 'text-[var(--color-ink-soft)]',
                    ].join(' ')
                  }
                >
                  {label}
                </NavLink>
              )
            )}

          </div>
        </div>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="container-page py-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
```


