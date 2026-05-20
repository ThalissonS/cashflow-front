import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovaDespesa } from './nova-despesa';

describe('NovaDespesa', () => {
  let component: NovaDespesa;
  let fixture: ComponentFixture<NovaDespesa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaDespesa],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaDespesa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
