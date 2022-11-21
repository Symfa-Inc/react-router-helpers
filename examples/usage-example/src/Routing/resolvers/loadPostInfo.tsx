import { Resolver } from '@symfa/react-router-helpers';

export const loadPostInfo: Resolver = () => () => {
  const url = 'https://jsonplaceholder.typicode.com/posts/1';
  return fetch(url)
    .then(response => response.json())
};
