import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovaCategoria } from './nova-categoria';

describe('NovaCategoria', () => {
  let component: NovaCategoria;
  let fixture: ComponentFixture<NovaCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
