import { toNestErrors, validateFieldsNatively } from "@hookform/resolvers";
import type { Resolver } from "@hookform/resolvers/zod";
import type { FieldError, FieldErrors, FieldValues, ResolverOptions } from "react-hook-form";
import { appendErrors } from "react-hook-form";
import type { ZodIssue } from "zod";

type ZodErrorLike = {
  issues?: ZodIssue[];
  errors?: ZodIssue[];
};

type ZodIssueWithUnionErrors = {
  unionErrors?: ZodErrorLike[];
};

type ZodIssueWithUnionIssueGroups = {
  errors?: ZodIssue[][];
};

const getIssues = (error: unknown): ZodIssue[] | null => {
  if (typeof error !== "object" || error === null) return null;
  const candidate = error as ZodErrorLike;
  if (Array.isArray(candidate.issues)) return candidate.issues;
  if (Array.isArray(candidate.errors)) return candidate.errors;
  return null;
};

const getUnionIssueGroups = (issue: ZodIssue): ZodIssue[][] | null => {
  if (typeof issue !== "object" || issue === null) return null;

  const issueWithErrors = issue as ZodIssueWithUnionIssueGroups;
  if (Array.isArray(issueWithErrors.errors)) {
    const groups = issueWithErrors.errors.filter((group) => Array.isArray(group));
    if (groups.length) return groups;
  }

  const issueWithUnionErrors = issue as ZodIssueWithUnionErrors;
  if (Array.isArray(issueWithUnionErrors.unionErrors)) {
    const groups = issueWithUnionErrors.unionErrors
      .map((unionError) => {
        const unionIssues =
          (unionError as ZodErrorLike).issues ?? (unionError as ZodErrorLike).errors;
        return Array.isArray(unionIssues) ? unionIssues : null;
      })
      .filter((group): group is ZodIssue[] => Array.isArray(group));

    if (groups.length) return groups;
  }

  return null;
};

const parseErrorSchema = (issues: ZodIssue[], validateAllFieldCriteria: boolean) => {
  const errors: Record<string, FieldError> = {};

  for (; issues.length; ) {
    const issue = issues.shift();
    if (!issue) {
      continue;
    }
    const { code, message, path } = issue;
    const pathKey = path.join(".");
    const unionIssueGroups = getUnionIssueGroups(issue);
    const firstUnionIssue = unionIssueGroups?.[0]?.[0];

    if (!errors[pathKey]) {
      if (firstUnionIssue) {
        errors[pathKey] = {
          message: firstUnionIssue?.message ?? message,
          type: firstUnionIssue?.code ?? code,
        };
      } else {
        errors[pathKey] = { message, type: code };
      }
    }

    if (unionIssueGroups) {
      for (const unionIssues of unionIssueGroups) {
        for (const unionIssue of unionIssues) {
          issues.push(unionIssue);
        }
      }
    }

    if (validateAllFieldCriteria) {
      const types = errors[pathKey].types;
      const messages = types?.[issue.code];
      errors[pathKey] = appendErrors(
        pathKey,
        validateAllFieldCriteria,
        errors,
        code,
        messages ? ([] as string[]).concat(messages as string[], issue.message) : issue.message,
      ) as FieldError;
    }
  }

  return errors;
};

export const zodResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async <TFieldValues extends FieldValues, TContext>(
    values: TFieldValues,
    _: TContext | undefined,
    options: ResolverOptions<TFieldValues>,
  ) => {
    try {
      const data = await schema[resolverOptions.mode === "sync" ? "parse" : "parseAsync"](
        values,
        schemaOptions,
      );

      if (options.shouldUseNativeValidation) {
        validateFieldsNatively({}, options);
      }

      return {
        errors: {},
        values: resolverOptions.raw ? values : (data as TFieldValues),
      };
    } catch (error) {
      const issues = getIssues(error);
      if (issues) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              [...issues],
              !options.shouldUseNativeValidation && options.criteriaMode === "all",
            ),
            options,
          ) as FieldErrors<TFieldValues>,
        };
      }

      throw error;
    }
  };
