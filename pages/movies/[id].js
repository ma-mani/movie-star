import { useRouter } from "next/router";

import Image from "next/image";
import styled from "styled-components";
import useSWR from "swr";
import StyledLink from "@/components/styledLink";
import ReviewForm from "@/components/ReviewForm";
import Reviews from "@/components/Reviews";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MovieDetailsWrapper = styled.div`
  padding: 2.4rem;
  background-color: var(--color-background-500);
  border-radius: 9px;
  position: relative;
  z-index: 0;
`;

const Text = styled.p`
  font-size: 14px;
  text-align: justify;
  margin: 1.5rem auto;
`;

const Ul = styled.ul`
  display: inline-grid;
  justify-content: flex-end;
  float: right;
  align-content: stretch;
`;

const List = styled.li`
  font-size: 12px;
  list-style: none;
  text-align: justify;
  display: flex;
`;

const Title = styled.li`
  font-size: 15px;
  list-style: none;
  display: flex;
`;

export default function MovieDetailsPage({ rating, setRating }) {
  const [editReviewId, setEditReviewId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const {
    data: movie,
    isLoading,
    mutate,
  } = useSWR(id ? `/api/movies/${id}` : null, fetcher);

  if (!movie) {
    return;
  }

  function onEditReview(reviewId) {
    setEditReviewId(reviewId);
  }

  const averageRating = movie.localData.reviews
    ?.map((review) => review.rating)
    .reduce(
      (accumulator, currentValue, index, array) =>
        accumulator + currentValue / array.length,
      0
    );

  async function handleCreateReview(data) {
    await fetch(`/api/movies/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review: data.review, rating: data.rating }),
    });
    mutate();
  }

  async function handleDeleteReview(idReview) {
    await fetch(`/api/movies/${id}/reviews`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: idReview }),
    });
    mutate();
  }

  async function handleEditReview(data) {
    await fetch(`/api/movies/${id}/reviews`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        review: data.review,
        rating: data.rating,
        reviewId: data.reviewId,
      }),
    });
    mutate();
    setIsEditMode(false);
  }

  return (
    <>
      <MovieDetailsWrapper>
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          alt="Movie Poster"
          width={150}
          height={220}
        />
        <Ul>
          <Title>{movie.title}</Title>
          <List>{movie.release_date}</List>
          <List>{movie.runtime} min</List>
          <List>{movie.genres[0].name}</List>
          <List>TMDB Rating: {movie.vote_average}</List>
          <List>User Rating: {averageRating ? averageRating : 0}</List>
        </Ul>
        <Text>{movie.overview}</Text>
        <Reviews
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          reviews={movie.localData.reviews}
          onEdit={onEditReview}
          movieId={movie.id}
          onDelete={handleDeleteReview}
        />
        <ReviewForm
          isEditMode={isEditMode}
          rating={rating}
          setRating={setRating}
          onSubmit={isEditMode ? handleEditReview : handleCreateReview}
          setIsEditMode={setIsEditMode}
          value={isEditMode ? movie.localData.reviews : ""}
          movieId={movie.id}
          reviewId={editReviewId}
        />
        <StyledLink href="/">Home</StyledLink>
      </MovieDetailsWrapper>
    </>
  );
}
