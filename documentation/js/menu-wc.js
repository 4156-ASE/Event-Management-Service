'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">event-management-service documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' : 'data-bs-target="#xs-controllers-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' :
                                            'id="xs-controllers-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' : 'data-bs-target="#xs-injectables-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' :
                                        'id="xs-injectables-links-module-AppModule-7ab2161d4d448eba0fa938cd7a50d056e92a84c1326130aec3f5519b0666a543eb2a9eec129d7c8ee58425a2650a2e015ccbb28b73ca6789176d77b46d6fe876"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsModule.html" data-type="entity-link" >EventsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' : 'data-bs-target="#xs-controllers-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' :
                                            'id="xs-controllers-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' }>
                                            <li class="link">
                                                <a href="controllers/EventsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' : 'data-bs-target="#xs-injectables-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' :
                                        'id="xs-injectables-links-module-EventsModule-4b5ef5b3fff31b093c463de13a9674f89ab0162641db5d340fab87c448095ae8c983ec980bde30d3cb10df83a933ec3899970e6ff0c71be00a3827a729b2ce96"' }>
                                        <li class="link">
                                            <a href="injectables/EventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ParticipantsModule.html" data-type="entity-link" >ParticipantsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' : 'data-bs-target="#xs-controllers-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' :
                                            'id="xs-controllers-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' }>
                                            <li class="link">
                                                <a href="controllers/ParticipantsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ParticipantsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' : 'data-bs-target="#xs-injectables-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' :
                                        'id="xs-injectables-links-module-ParticipantsModule-392f002452ff8eafc161505d9385699ffffbb2ceac08ee24c7e4f11fe68ca9d7880ea7d9a3b58422417df3096c05a22f539e6abd5cd81a2d462f33cfffd5e7a5"' }>
                                        <li class="link">
                                            <a href="injectables/ParticipantsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ParticipantsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' : 'data-bs-target="#xs-controllers-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' :
                                            'id="xs-controllers-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' : 'data-bs-target="#xs-injectables-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' :
                                        'id="xs-injectables-links-module-UserModule-fc976c5104a6fb6dd349322652c482dae3263dccc278bfb340e8f9fa514474137bcb7cc72a1c088f921507be881501f2481dd7b268d58f4a7e1505a0edc7abee"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/EventEntity.html" data-type="entity-link" >EventEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ParticipantEntity.html" data-type="entity-link" >ParticipantEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/UserEntity.html" data-type="entity-link" >UserEntity</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/EventInterface.html" data-type="entity-link" >EventInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParticipantInterface.html" data-type="entity-link" >ParticipantInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserInterface.html" data-type="entity-link" >UserInterface</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});