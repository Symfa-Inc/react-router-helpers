import { useResolver } from '../../../reactRouterHelpers';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const ResolversPage = () => {
  const { postInfo } = useResolver<{ postInfo: Post; }>();

  return <>
    <h1>Resolver page</h1>
    <div className="card" style={{ width: '18rem' }}>
      <div className="card-body">
        <h5 className="card-title">{postInfo.title}</h5>
        <p className="card-text">{postInfo.body}</p>
      </div>
    </div>
  </>;
};
