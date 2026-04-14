import type { MouseEventHandler, ReactNode } from "react";
import { useCallback, useMemo } from "react";

import { Link as TanStackLink, Outlet as TanStackOutlet, useNavigate as useTanStackNavigate, useRouterState } from "@tanstack/react-router";
import { WebRoutes } from "@forum-reddit/routes";

type SearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;

type NavigateOptions = {
  replace?: boolean;
};

type CommonLinkProps = {
  children?: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type LinkProps = CommonLinkProps & {
  to: string;
};

type NavLinkProps = Omit<CommonLinkProps, "className"> & {
  to: string;
  className?: string | ((state: { isActive: boolean }) => string);
};

function toSearchObject(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries());
}

function useCurrentLocation() {
  return useRouterState({
    select: (state) => state.location,
  });
}

export function Link({ to, children, ...props }: LinkProps) {
  return (
    <TanStackLink to={to} {...props}>
      {children}
    </TanStackLink>
  );
}

export function NavLink({ to, className, children, ...props }: NavLinkProps) {
  const exact = to === WebRoutes.home;
  const activeClassName = typeof className === "function" ? className({ isActive: true }) : className;
  const inactiveClassName = typeof className === "function" ? className({ isActive: false }) : className;

  return (
    <TanStackLink
      to={to}
      activeOptions={{ exact }}
      activeProps={activeClassName ? { className: activeClassName } : undefined}
      inactiveProps={inactiveClassName ? { className: inactiveClassName } : undefined}
      {...props}
    >
      {children}
    </TanStackLink>
  );
}

export const Outlet = TanStackOutlet;

export function useNavigate() {
  const navigate = useTanStackNavigate();

  return useCallback(
    (to: string, options?: NavigateOptions) =>
      navigate({
        to,
        replace: options?.replace,
      }),
    [navigate],
  );
}

export function useParams<TParams extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return useRouterState({
    select: (state: any) =>
      state.matches.reduce((params: Record<string, string | undefined>, match: any) => {
        Object.assign(params, match.params);
        return params;
      }, {}),
  } as never) as TParams;
}

export function useSearchParams(): [
  URLSearchParams,
  (
    nextInit: SearchParamsInit | ((previous: URLSearchParams) => SearchParamsInit),
    options?: NavigateOptions,
  ) => void,
] {
  const location = useCurrentLocation();
  const navigate = useTanStackNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.searchStr), [location.searchStr]);

  const setSearchParams = useCallback(
    (
      nextInit: SearchParamsInit | ((previous: URLSearchParams) => SearchParamsInit),
      options?: NavigateOptions,
    ) => {
      const resolvedInit =
        typeof nextInit === "function" ? nextInit(new URLSearchParams(location.searchStr)) : nextInit;
      const nextSearchParams = new URLSearchParams(resolvedInit);

      void navigate({
        to: location.pathname,
        search: toSearchObject(nextSearchParams),
        hash: location.hash,
        replace: options?.replace,
      });
    },
    [location.hash, location.pathname, location.searchStr, navigate],
  );

  return [searchParams, setSearchParams];
}
