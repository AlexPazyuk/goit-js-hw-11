import axios from "axios";
import Notiflix from "notiflix";
// Описаний в документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.getElementById("search-form");
const gallery = document.querySelector(".gallery");
const loadMoreButton = document.querySelector(".load-more");

const API_KEY = "39090027-2154d255062d9e217ff355f0e";
const RESULTS_PER_PAGE = 40;

let currentPage = 1;
let currentSearchQuery = "";


loadMoreButton.style.display = "none";


searchForm.addEventListener("submit", async event => {
    event.preventDefault();
  const searchQuery = event.target.searchQuery.value.trim();
  currentSearchQuery = searchQuery;
currentPage = 1;
  if (searchQuery === "") {
    Notiflix.Notify.info("Please enter a search term");
    return;
  }
     try {
    const response = await searchImages(searchQuery);
    displayImages(response.data.hits);
    displayTotalHits(response.data.totalHits);
    // hideEndOfResultsMessage(); // Hide the end of results message when a new search is performed
    refreshLightbox();
  } catch (error) {
    showError();
  }
});


// function showEndOfResultsMessage() {
//   loadMoreButton.style.display = "none";
//   const endMessage = document.createElement("p");
//   endMessage.classList.add("end-message");
//   endMessage.textContent = "We're sorry, but you've reached the end of search results.";
//   gallery.appendChild(endMessage);
// }

// function hideEndOfResultsMessage() {
//   const endMessage = document.querySelector(".end-message");
//   if (endMessage) {
//     gallery.removeChild(endMessage);
//   }
// }

loadMoreButton.addEventListener("click", async () => {
  try {
    currentPage++;
    const response = await searchImages(currentSearchQuery, currentPage);
      appendImages(response.data.hits);
      scrollToNextGroup();
      refreshLightbox();
      if (response.data.hits.length > 0) {
      appendImages(response.data.hits);
      refreshLightbox();
      } else {
          Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
          loadMoreButton.style.display = "none";

    }
  } catch (error) {
    showError();
  }
});


function displayImages(images) {
    
        gallery.innerHTML = "";
        loadMoreButton.style.display = "block";

        images.forEach(image => {
            gallery.appendChild(createImageCard(image));
        })
    }


async function searchImages(query, page = 1) {
  const response = await axios.get("https://pixabay.com/api/", {
    params: {
      key: API_KEY,
      q: query,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
      page: page,
      per_page: RESULTS_PER_PAGE
    }
  });
  return response;
}

function appendImages(images) {
  images.forEach(image => {
    gallery.appendChild(createImageCard(image));
  });
}

function createImageCard(image) {
  const link = document.createElement("a");
  link.href = image.largeImageURL;
  link.classList.add("photo-card");

  const img = document.createElement("img");
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = "lazy";

  link.appendChild(img);

     const infoItems = [
    { label: "Likes", value: image.likes },
    { label: "Views", value: image.views },
    { label: "Comments", value: image.comments },
    { label: "Downloads", value: image.downloads }
  ];

  infoItems.forEach(item => {
    const infoItem = document.createElement("p");
    infoItem.className = "info-item";
    infoItem.innerHTML = `<b>${item.label}:</b> ${item.value}`;
    link.appendChild(infoItem);
  });

  return link;
}

function displayTotalHits(totalHits) {
    if (totalHits > 0) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    } else {
        showError();
    }
}

function showError() {
loadMoreButton.style.display = "none";
    gallery.innerHTML = "";
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.")
  
}

function scrollToNextGroup() {
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight,
        behavior: "smooth"
    });
}

function refreshLightbox() {
  const lightbox = new SimpleLightbox(".gallery a", {
    captionsData: "alt",
    captionDelay: 250,
    captionPosition: "bottom"
  });
}
