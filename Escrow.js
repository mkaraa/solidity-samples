const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        [buyer, seller, inspector, lender] = await ethers.getSigners();
        // console.log(signers);

        // Deploy Real Estate
        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstate.deploy();
        // console.log(realEstate.address)
        
        // Mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait();

        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        );

        // Approve property
        transaction = await realEstate.connect(seller).approve(escrow.address, 1);
        await transaction.wait();

        // List property
        transaction = await escrow.connect(seller).list(1);
        await transaction.wait()

    })

    describe('Deployment', () => {
        it('Returns NFT Address', async () => {
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address);
        })
    
        it('Returns Seller Address', async () => {
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address);
        })
    
        it('Returns Inspector Address', async () => {
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address);
        })
    
        it('Returns Lender Address', async () => {
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address);
        })    
    })

    describe('Listing', () => {

        it('Updates as listed', async () => {
            const result = await escrow.isListed(1);
            expect(result).to.be.equal(true);
        })

        it('Updates ownerships', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        })
    
        it('Returns buyer', async () => {
            const result = await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address);
        })

        it('Returns Purhase Price', async () => {
            const result = await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10));
        })

        it('Returns Escrow Amount', async () => {
            const result = await escrow.escrowAmount(1);
            expect(result).to.be.equal(tokens(5));
        })
    })

    describe('Deposits', () => {
        it('Update contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5)});
            await transaction.wait();
            const result =  await escrow.getBalance();
            expect(result).to.be.equal(tokens(5));
        })
    })

    describe('Inspection', () => {
        it('Updates inspection status', async() => {
            it('Update contract balance', async () => {
                const transaction = await escrow.connect(inspector).depositEarnest(1, true);
                await transaction.wait();
                const result =  await escrow.getInspectionPassed(1);
                expect(result).to.be.equal(true);
            })  
        })
    })


    describe('Approval', () => {
        it('Update approval status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();

            expect(escrow.approval(1, buyer.address)).to.be.equal(true);
            expect(escrow.approval(1, seller.address)).to.be.equal(true);
            expect(escrow.approval(1, lender.address)).to.be.equal(true);

        })
    })
})
