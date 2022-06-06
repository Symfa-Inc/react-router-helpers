import * as React from 'react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const GeneralLink: FC<{ title?: string; link: string; id?: string; replace?: boolean }> = ({
                                                                                                   title,
                                                                                                   link,
                                                                                                   id,
                                                                                                   replace,
                                                                                                 }) => {
  const navigate = useNavigate();

  function handleClick() {
    navigate(link, { replace });
  }

  return <button id={id} onClick={handleClick}>{title}</button>;
};
