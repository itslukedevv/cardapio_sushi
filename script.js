console.log("JS carregou");
console.log("ABRIU MODAL", produtos);

document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio();
});

const NUMERO_WHATSAPP = "31920024877";


document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio();

    document.querySelector(".close").addEventListener("click", fecharModal);

    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") {
            fecharModal();
        }
    });
});

async function carregarCardapio() {
    console.log("INICIO CARREGAMENTO");

    try {
        const indexRes = await fetch("produtos/index.json");
        console.log("INDEX STATUS:", indexRes.status);

        const index = await indexRes.json();
        console.log("INDEX OK");

        const categorias = [];

        for (const cat of index.categorias) {

            console.log("CARREGANDO:", cat.arquivo);

            try {
                const res = await fetch(`produtos/${cat.arquivo}`);
                console.log(cat.arquivo, "STATUS:", res.status);

                const dados = await res.json();

                if (!dados.produtos) {
                    console.warn("SEM PRODUTOS:", cat.id, dados);
                    continue;
                }

                categorias.push({
                    id: cat.id,
                    nome: cat.nome,
                    icone: cat.icone,
                    produtos: dados.produtos
                });

            } catch (err) {
                console.error("ERRO NESSA CATEGORIA:", cat.arquivo, err);
            }
        }

        console.log("FINAL:", categorias);

        criarCategorias(categorias);
        criarProdutos(categorias);

    } catch (e) {
        console.error("ERRO FATAL INDEX:", e);
    }
}

function criarCategorias(categorias) {
    const nav = document.querySelector(".categorias");

    nav.innerHTML = "";

    categorias.forEach(categoria => {
        const botao = document.createElement("button");

        botao.textContent = `${categoria.icone} ${categoria.nome}`;

        botao.addEventListener("click", () => {
            document.getElementById(categoria.id).scrollIntoView({
                behavior: "smooth"
            });
        });

        nav.appendChild(botao);
    });
}

function criarProdutos(categorias) {
    const container = document.getElementById("produtos");

    container.innerHTML = "";

    categorias.forEach(categoria => {

        const section = document.createElement("section");
        section.className = "categoria";
        section.id = categoria.id;

        section.innerHTML = `
            <h2>${categoria.icone} ${categoria.nome}</h2>
            <div class="grid-produtos"></div>
        `;

        const grid = section.querySelector(".grid-produtos");

        categoria.produtos
            .filter(produto => !produto.esgotado)
            .forEach(produto => {

                const card = document.createElement("div");
                card.className = "card-produto";

                card.innerHTML = `
                    <div class="card-info">

                        <h3>${produto.nome}</h3>

                        <p>${produto.descricao || ""}</p>

                        ${produto.imagem ? `
                            <img class="card-img" src="${produto.imagem}" alt="${produto.nome}">
                        ` : `
                            <div class="card-no-img">
                                ${produto.nome}
                            </div>
                        `}

                        <div class="card-bottom">
                            <strong>
                                $ ${produto.preco.toFixed(2).replace(".", ",")}
                            </strong>
                        </div>

                    </div>
                `;

                card.addEventListener("click", () => {
                    abrirModal(produto);
                });

                grid.appendChild(card);
            });

        container.appendChild(section);
    });
}

function abrirModal(produto) {

    document.body.style.overflow = "hidden";

    const modal = document.getElementById("modal");

    modal.style.display = "flex";

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    const img = document.getElementById("modal-imagem");

    img.src = produto.imagem || "";
    img.alt = produto.nome;
    img.style.display = "block";

    document.getElementById("modal-nome").textContent = produto.nome;

    document.getElementById("modal-descricao").textContent =
        produto.descricao || "";

    document.getElementById("modal-preco").textContent =
        `$ ${produto.preco.toFixed(2).replace(".", ",")}`;

    const pecasEl = document.getElementById("modal-pecas");

    if (produto.pecas && Number(produto.pecas) > 0) {
        pecasEl.textContent = `🍣 ${produto.pecas} peças`;
        pecasEl.style.display = "inline-flex";
    } else {
        pecasEl.style.display = "none";
    }

    const ingredientesBox = document.getElementById("ingredientes-box");
    const ingredientes = document.getElementById("modal-ingredientes");

    ingredientes.innerHTML = "";

    if (produto.ingredientes?.length) {
        ingredientesBox.style.display = "block";

        produto.ingredientes.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientes.appendChild(li);
        });

    } else {
        acompanhaBox.style.display = "block";

        const li = document.createElement("li");
        li.textContent = "Não acompanha molhos ou hashi.";
        acompanha.appendChild(li);
    }

    const acompanhaBox = document.getElementById("acompanha-box");
    const acompanha = document.getElementById("modal-acompanha");

    acompanha.innerHTML = "";

    if (produto.acompanha?.length) {
        acompanhaBox.style.display = "block";

        produto.acompanha.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            acompanha.appendChild(li);
        });

    } else {
        acompanhaBox.style.display = "none";
    }

    const btnWhatsapp = document.querySelector(".btn-whatsapp");
    const btnIfood = document.querySelector(".btn-ifood");

    btnWhatsapp.onclick = () => {
        const mensagem = montarPedido(produto);

        window.open(
            `https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`,
            "_blank"
        );
    };

    btnIfood.onclick = () => {
        window.open(
            "https://www.ifood.com.br/delivery/sabara-mg/sushi-kon-rosario/cece03c5-14d2-4cb8-be6c-b18082cf49a4?utm_medium=share",
            "_blank"
        );
    };



    document.body.style.overflow = "hidden";
    modal.style.display = "flex";
}

function fecharModal() {

    const modal = document.getElementById("modal");

    modal.classList.add("hide");

    document.body.style.overflow = "auto";

    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove("hide");
    }, 180);
}
modal.style.display = "none";
document.body.style.overflow = "auto";


document.querySelector(".close").addEventListener("click", fecharModal);

function montarPedido(produto) {
    let msg = `Olá! Gostaria de pedir:\n\n`;
    msg += `🍣 ${produto.nome}\n`;
    msg += `💰 $ ${produto.preco.toFixed(2).replace(".", ",")}\n`;
    msg += `📦 ${produto.pecas} peças\n\n`;
    msg += `Obrigado!`;

    return encodeURIComponent(msg);
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".close").addEventListener("click", fecharModal);
});