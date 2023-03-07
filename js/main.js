let boxImg = document.querySelector('.box-img');
boxImg.addEventListener('click', highlightSelection);
function highlightSelection () {
    boxImg.classList.toggle('box-img-selected');
}