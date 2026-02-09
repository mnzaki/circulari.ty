import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { IPersistenceServices } from '@repo/persistence/services';
import type { FetchUrlPreviewFn } from './services/preview.service.js';
import { PersonService } from './services/person.service.js';
import { PostService } from './services/post.service.js';
import { SessionService } from './services/session.service.js';
import { ViewService } from './services/view.service.js';
import { PreviewService } from './services/preview.service.js';

// Types
export type {
  UAddress,
  ContentType,
  TextSpan,
  SpatiotemporalPoint,
  XanaduLink,
  LinkPreview,
  AccumulableBit,
  InputType,
  Post,
  AccumulatingPost,
  ViewFilters,
  SortBy,
  View,
  Person,
  CachedPreview
} from '@repo/persistence';

export {
  createEmptyAccumulation,
  commitAccumulation
} from '@repo/persistence';

// Services
export type {
  IPostService,
  PostServiceFilters,
  IViewService,
  ISessionService,
  IPersonService,
  IPreviewService,
  IPersistenceServices
} from '@repo/persistence';

export {
  PostService,
  ViewService,
  SessionService,
  PersonService,
  PreviewService
} from './services/index.js';

export type { 
  FetchUrlPreviewFn,
  PreviewResult,
  HtmlPreviewResult,
  MediaPreviewResult 
} from './services/preview.service.js';

export function createServices(
  db: BaseSQLiteDatabase<any, any>,
  options?: {
    urlPreviewFetcher?: FetchUrlPreviewFn;
  }
) {
  return {
    post: new PostService(db),
    view: new ViewService(db),
    session: new SessionService(db),
    person: new PersonService(db),
    preview: new PreviewService(db, options?.urlPreviewFetcher)
  };
}
