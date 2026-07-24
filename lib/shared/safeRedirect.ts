/** Guards against open-redirect: only a same-site relative path is safe to
 *  send a user to after auth — anything protocol-relative or absolute isn't. */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}
