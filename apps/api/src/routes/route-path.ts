export function createChildRoute(mountPath: string, routePath: string) {
  if (routePath === mountPath) {
    return "/";
  }

  const normalizedMountPath = mountPath.endsWith("/") ? mountPath : `${mountPath}/`;

  if (!routePath.startsWith(normalizedMountPath)) {
    throw new Error(`Route "${routePath}" is not mounted below "${mountPath}".`);
  }

  return `/${routePath.slice(normalizedMountPath.length)}`;
}
