import type { TResult } from '../../utils/result.ts';
import type { ITemplateProperties, Template } from '../template/Template.ts';
import type {
  DaoException,
  IDaoRequestOptions,
  IDaoRequestQuery,
  NotFoundOnRepositoryException,
} from './dao-types.ts';

export interface ITemplateRepository {
  getOne<Id extends ITemplateProperties['id']>(
    param: ITemplateRepositoryGetOneByIdParams<Id>,
  ): Promise<
    TResult<
      {
        readonly item: Template<Id>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<NameInSingular extends ITemplateProperties['nameInSingular']>(
    param: ITemplateRepositoryGetOneByNameInSingularParams<NameInSingular>,
  ): Promise<
    TResult<
      {
        readonly item: Template<ITemplateProperties['id'], NameInSingular>;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getOne<NameInPlural extends ITemplateProperties['nameInPlural']>(
    param: ITemplateRepositoryGetOneByNameInPluralParams<NameInPlural>,
  ): Promise<
    TResult<
      {
        readonly item: Template<
          ITemplateProperties['id'],
          ITemplateProperties['nameInSingular'],
          NameInPlural
        >;
      },
      NotFoundOnRepositoryException | DaoException
    >
  >;

  getMany<R extends Template, Q extends IDaoRequestQuery<R>>(
    param: ITemplateRepositoryGetManyParams<R, Q>,
  ): Promise<
    TResult<
      {
        readonly items: readonly R[];
      },
      DaoException
    >
  >;

  save(param: {
    readonly item: Pick<Template, keyof ITemplateProperties>;
  }): Promise<TResult<Record<never, never>, DaoException>>;

  deleteOne<Id extends ITemplateProperties['id']>(
    param: ITemplateRepositoryDeleteOneParams<Id>,
  ): Promise<TResult<Record<never, never>, DaoException>>;

  deleteMany(
    param: ITemplateRepositoryDeleteManyParams,
  ): Promise<TResult<Record<never, never>, DaoException>>;
}

export interface ITemplateRepositoryGetOneByIdParams<Id extends ITemplateProperties['id']> {
  readonly id: Id;
}

export interface ITemplateRepositoryGetOneByNameInSingularParams<
  NameInSingular extends ITemplateProperties['nameInSingular'],
> {
  readonly nameInSingular: NameInSingular;
}

export interface ITemplateRepositoryGetOneByNameInPluralParams<
  NameInPlural extends ITemplateProperties['nameInPlural'],
> {
  readonly nameInPlural: NameInPlural;
}

export interface ITemplateRepositoryGetManyParams<
  R extends Template,
  Q extends IDaoRequestQuery<R>,
> {
  readonly query?: Q;
  readonly options?: IDaoRequestOptions<R>;
}

export interface ITemplateRepositoryDeleteOneParams<Id extends ITemplateProperties['id']> {
  readonly id: Id;
}

export interface ITemplateRepositoryDeleteManyParams {
  readonly query?: IDaoRequestQuery<Template>;
}
