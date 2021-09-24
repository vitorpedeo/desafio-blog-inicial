import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Document } from '@prismicio/client/types/documents';

type Post = {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
};

export const dateFormatter = (rawDate: string): string => {
  const parsedDate = parseISO(rawDate);

  return format(parsedDate, 'dd MMM yyyy', { locale: ptBR });
};

export const homePostFormatter = (post: Document): Post => {
  return {
    uid: post.uid,
    first_publication_date: dateFormatter(post.first_publication_date),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  };
};
