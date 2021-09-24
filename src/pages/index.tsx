import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Prismic from '@prismicio/client';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { homePostFormatter } from '../utils/formaters';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState(() => results);
  const [nextPage, setNextPage] = useState(() => next_page);

  const loadMorePosts = async (): Promise<void> => {
    try {
      const response = await fetch(nextPage);
      const postsResponse = (await response.json()) as ApiSearchResponse;

      const newPosts = postsResponse.results.map(post =>
        homePostFormatter(post)
      );

      setPosts(prevState => [...prevState, ...newPosts]);
      setNextPage(postsResponse.next_page);
    } catch (error) {
      //
    }
  };

  return (
    <>
      <Head>
        <title>spacetraveling | Home</title>
      </Head>

      <div className={styles.homeContainer}>
        <header>
          <Image src="/logo.svg" alt="logo" width={239} height={26} />
        </header>

        <main className={styles.homeMainContent}>
          <ul>
            {posts.map(post => (
              <li key={post.uid} className={styles.postItem}>
                <Link href={`/posts/${post.uid}`}>
                  <a>
                    <h2>{post.data.title}</h2>
                    <p>{post.data.subtitle}</p>

                    <div>
                      <p>
                        <FiCalendar size={20} />
                        <time>{post.first_publication_date}</time>
                      </p>
                      <p>
                        <FiUser size={20} />
                        <span>{post.data.author}</span>
                      </p>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>

          {nextPage && (
            <button
              type="button"
              onClick={loadMorePosts}
              className={styles.loadMorePostsButton}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  const posts = postsResponse.results.map(post => homePostFormatter(post));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
