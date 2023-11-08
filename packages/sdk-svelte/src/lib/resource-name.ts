import type { commonApi } from '@viamrobotics/sdk';

export type ResourceName = commonApi.ResourceName.AsObject;

/**
 *
 * @param target The first resource to be compared
 * @param other The second resource to be compared
 * @returns The sort order
 */
export const sortResourceNames = (
  target: ResourceName,
  other: ResourceName
) => {
  if (target.name > other.name) {
    return 1;
  } else if (target.name < other.name) {
    return -1;
  }

  if (target.subtype > other.subtype) {
    return 1;
  } else if (target.subtype < other.subtype) {
    return -1;
  }

  if (target.type > other.type) {
    return 1;
  } else if (target.type < other.type) {
    return -1;
  }

  return target.namespace > other.namespace ? 1 : -1;
};

export type ResourceNameTuple = `${string}:${string}:${string}`;

/**
 * Returns the resource's namespace, type, and subtype as a semi-colon
 * delineated string tuple.
 *
 * @param resource The resource
 * @returns A tuple of the resource namespace:type:subtype
 */
export const getResourceNameTuple = ({
  namespace,
  type,
  subtype,
}: ResourceName): ResourceNameTuple => `${namespace}:${type}:${subtype}`;

export type ResourceNameString =
  | ResourceNameTuple
  | `${ResourceNameTuple}/${string}`;

/**
 * Returns the resource's full name, beginning with the resource's tuple and
 * name separated by a slash.
 *
 * @param resourceName The resource
 * @returns The full resource name formatted as namespace:type:subtype/name
 */
export const getResourceNameString = (
  resourceName: ResourceName
): ResourceNameString => {
  const { name } = resourceName;
  const tuple = getResourceNameTuple(resourceName);

  if (name) {
    return `${tuple}/${name}`;
  }

  return tuple;
};

export const getResourceNameFromString = (
  resourceNameString: ResourceNameString
) => {
  const [tuple, name = ''] = resourceNameString.split('/');
  const tupleParts = tuple?.split(':') ?? [];

  if (tupleParts.length > 3) {
    throw new Error('more than 2 colons in resource name string');
  }

  if (tupleParts.length < 3) {
    throw new Error('less than 2 colons in resource name string');
  }

  return {
    namespace: tupleParts[0],
    type: tupleParts[1],
    subtype: tupleParts[2],
    name,
  };
};

export interface ResourceSubtypeFilterOptions {
  remote?: boolean;
  name?: boolean;
}

/**
 *  Filters a list of resources by their subtypes with additional options.
 *
 * @param resources A list of resources
 * @param subtype The subtype to filter by
 * @param options Optional arguments to include remotes and require a name
 * @returns A filtered list of resources
 */
export const filterResouceNamesBySubtype = (
  resources: ResourceName[],
  subtype: string,
  options: ResourceSubtypeFilterOptions = {}
) => {
  const results: ResourceName[] = [];
  const { remote = true, name = false } = options;

  for (const resource of resources) {
    if (!remote && resource.name.includes(':')) {
      continue;
    }

    if (name && !resource.name) {
      continue;
    }

    if (resource.subtype === subtype) {
      results.push(resource);
    }
  }

  return results;
};
